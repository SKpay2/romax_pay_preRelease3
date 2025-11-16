import TelegramBot from 'node-telegram-bot-api';
import { storage } from '../storage';
import { hashPasswordWithSalt } from '../utils/password';
import { setOperatorOnline, assignTaskToOperator, notifyOperatorTaskTaken } from '../services/operatorService';
import { sendNotificationToUser } from './bot';
import { formatUsdtBalance } from '../config/tron';

let operatorBot: TelegramBot | null = null;

const loginSessions = new Map<string, { stage: 'login' | 'password'; login?: string }>();

export function initializeOperatorBot(token: string): TelegramBot {
  if (operatorBot) {
    return operatorBot;
  }

  operatorBot = new TelegramBot(token, { polling: true });

  operatorBot.setMyCommands([
    { command: 'start', description: 'Авторизация оператора' },
    { command: 'online', description: 'Перейти в онлайн' },
    { command: 'offline', description: 'Перейти в офлайн' },
    { command: 'status', description: 'Проверить статус' },
  ]);

  operatorBot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString();
    const text = msg.text || '';

    if (text.startsWith('/start')) {
      await handleStart(chatId);
    } else if (text.startsWith('/online')) {
      await handleOnline(chatId);
    } else if (text.startsWith('/offline')) {
      await handleOffline(chatId);
    } else if (text.startsWith('/status')) {
      await handleStatus(chatId);
    } else {
      await handleMessage(chatId, text);
    }
  });

  operatorBot.on('callback_query', async (query) => {
    if (!query.message) return;
    
    const chatId = query.message.chat.id.toString();
    const data = query.data || '';
    const messageId = query.message.message_id;

    await handleCallback(chatId, data, messageId);
    
    await operatorBot!.answerCallbackQuery(query.id);
  });

  console.log('Operator bot initialized successfully');
  return operatorBot;
}

export function getOperatorBot(): TelegramBot {
  if (!operatorBot) {
    throw new Error('Operator bot not initialized. Call initializeOperatorBot first.');
  }
  return operatorBot;
}

async function handleStart(chatId: string) {
  loginSessions.set(chatId, { stage: 'login' });
  
  await operatorBot!.sendMessage(
    chatId,
    '👋 <b>Добро пожаловать в панель оператора!</b>\n\n' +
    'Для авторизации введите ваш логин:',
    { parse_mode: 'HTML' }
  );
}

async function handleMessage(chatId: string, text: string) {
  const session = loginSessions.get(chatId);
  
  if (!session) {
    await operatorBot!.sendMessage(
      chatId,
      'Используйте /start для авторизации',
      { parse_mode: 'HTML' }
    );
    return;
  }

  if (session.stage === 'login') {
    loginSessions.set(chatId, { stage: 'password', login: text });
    await operatorBot!.sendMessage(
      chatId,
      '🔐 Введите пароль:',
      { parse_mode: 'HTML' }
    );
  } else if (session.stage === 'password') {
    await handleLogin(chatId, session.login!, text);
    loginSessions.delete(chatId);
  }
}

async function handleLogin(chatId: string, login: string, password: string) {
  try {
    const operator = await storage.getOperatorByLogin(login);
    
    if (!operator) {
      await operatorBot!.sendMessage(
        chatId,
        '❌ Неверный логин или пароль.\n\nИспользуйте /start для повторной попытки',
        { parse_mode: 'HTML' }
      );
      return;
    }

    if (operator.isActive !== 1) {
      await operatorBot!.sendMessage(
        chatId,
        '❌ Ваш аккаунт деактивирован. Обратитесь к администратору.',
        { parse_mode: 'HTML' }
      );
      return;
    }

    const passwordHash = hashPasswordWithSalt(password, operator.salt);
    
    if (passwordHash !== operator.passwordHash) {
      await operatorBot!.sendMessage(
        chatId,
        '❌ Неверный логин или пароль.\n\nИспользуйте /start для повторной попытки',
        { parse_mode: 'HTML' }
      );
      return;
    }

    await storage.setOperatorChatId(operator.id, chatId);
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🟢 Онлайн', callback_data: 'status_online' },
          { text: '🔴 Офлайн', callback_data: 'status_offline' }
        ]
      ]
    };

    await operatorBot!.sendMessage(
      chatId,
      `✅ <b>Авторизация успешна!</b>\n\n` +
      `👤 Оператор: ${operator.login}\n` +
      `📊 Статус: ${operator.isOnline ? '🟢 Онлайн' : '🔴 Офлайн'}\n\n` +
      `Выберите свой статус:`,
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Error in handleLogin:', error);
    await operatorBot!.sendMessage(
      chatId,
      '❌ Ошибка авторизации. Попробуйте позже.',
      { parse_mode: 'HTML' }
    );
  }
}

async function handleOnline(chatId: string) {
  try {
    const operators = await storage.getAllOperators();
    const operator = operators.find(op => op.chatId === chatId);
    
    if (!operator) {
      await operatorBot!.sendMessage(
        chatId,
        '❌ Используйте /start для авторизации',
        { parse_mode: 'HTML' }
      );
      return;
    }

    await setOperatorOnline(operator.id, true);
    
    await operatorBot!.sendMessage(
      chatId,
      '🟢 <b>Вы в сети!</b>\n\nТеперь вы будете получать уведомления о новых заявках.',
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    console.error('Error in handleOnline:', error);
    await operatorBot!.sendMessage(
      chatId,
      '❌ Ошибка при изменении статуса',
      { parse_mode: 'HTML' }
    );
  }
}

async function handleOffline(chatId: string) {
  try {
    const operators = await storage.getAllOperators();
    const operator = operators.find(op => op.chatId === chatId);
    
    if (!operator) {
      await operatorBot!.sendMessage(
        chatId,
        '❌ Используйте /start для авторизации',
        { parse_mode: 'HTML' }
      );
      return;
    }

    await setOperatorOnline(operator.id, false);
    
    await operatorBot!.sendMessage(
      chatId,
      '🔴 <b>Вы оффлайн</b>\n\nВы больше не будете получать уведомления о новых заявках.',
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    console.error('Error in handleOffline:', error);
    await operatorBot!.sendMessage(
      chatId,
      '❌ Ошибка при изменении статуса',
      { parse_mode: 'HTML' }
    );
  }
}

async function handleStatus(chatId: string) {
  try {
    const operators = await storage.getAllOperators();
    const operator = operators.find(op => op.chatId === chatId);
    
    if (!operator) {
      await operatorBot!.sendMessage(
        chatId,
        '❌ Используйте /start для авторизации',
        { parse_mode: 'HTML' }
      );
      return;
    }

    const statusEmoji = operator.isOnline ? '🟢' : '🔴';
    const statusText = operator.isOnline ? 'Онлайн' : 'Офлайн';
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🟢 Онлайн', callback_data: 'status_online' },
          { text: '🔴 Офлайн', callback_data: 'status_offline' }
        ]
      ]
    };

    await operatorBot!.sendMessage(
      chatId,
      `📊 <b>Статус оператора</b>\n\n` +
      `👤 Логин: ${operator.login}\n` +
      `${statusEmoji} Статус: ${statusText}\n` +
      `⏰ Последняя активность: ${operator.lastActivityAt ? new Date(operator.lastActivityAt).toLocaleString('ru-RU') : 'N/A'}\n\n` +
      `Изменить статус:`,
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Error in handleStatus:', error);
    await operatorBot!.sendMessage(
      chatId,
      '❌ Ошибка при получении статуса',
      { parse_mode: 'HTML' }
    );
  }
}

async function handleCallback(chatId: string, data: string, messageId: number) {
  try {
    if (data === 'status_online' || data === 'status_offline') {
      await handleStatusChange(chatId, data === 'status_online', messageId);
    } else if (data.startsWith('take_')) {
      const requestId = data.substring(5);
      await handleTakeTask(chatId, requestId, messageId);
    } else if (data.startsWith('reject_')) {
      const requestId = data.substring(7);
      await handleRejectTask(chatId, requestId, messageId);
    }
  } catch (error) {
    console.error('Error in handleCallback:', error);
  }
}

async function handleStatusChange(chatId: string, isOnline: boolean, messageId: number) {
  try {
    const operators = await storage.getAllOperators();
    const operator = operators.find(op => op.chatId === chatId);
    
    if (!operator) {
      await operatorBot!.sendMessage(chatId, '❌ Ошибка: оператор не найден');
      return;
    }

    await setOperatorOnline(operator.id, isOnline);
    
    const statusEmoji = isOnline ? '🟢' : '🔴';
    const statusText = isOnline ? 'Онлайн' : 'Офлайн';
    
    await operatorBot!.editMessageText(
      `${statusEmoji} <b>Статус изменен: ${statusText}</b>\n\n` +
      `${isOnline ? 'Вы будете получать уведомления о новых заявках.' : 'Вы больше не будете получать уведомления.'}`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML'
      }
    );
  } catch (error) {
    console.error('Error in handleStatusChange:', error);
  }
}

async function handleTakeTask(chatId: string, requestId: string, messageId: number) {
  try {
    const operators = await storage.getAllOperators();
    const operator = operators.find(op => op.chatId === chatId);
    
    if (!operator) {
      await operatorBot!.sendMessage(chatId, '❌ Ошибка: оператор не найден');
      return;
    }

    const request = await storage.getPaymentRequest(requestId);
    
    if (!request) {
      await operatorBot!.editMessageText(
        '❌ Заявка не найдена',
        { chat_id: chatId, message_id: messageId, parse_mode: 'HTML' }
      );
      return;
    }

    if (request.assignedOperatorId) {
      await operatorBot!.editMessageText(
        `ℹ️ Заявка №${requestId.slice(-6)} уже взята в работу другим оператором`,
        { chat_id: chatId, message_id: messageId, parse_mode: 'HTML' }
      );
      return;
    }

    if (request.status !== 'submitted') {
      await operatorBot!.editMessageText(
        `ℹ️ Заявка №${requestId.slice(-6)} уже обработана (статус: ${request.status})`,
        { chat_id: chatId, message_id: messageId, parse_mode: 'HTML' }
      );
      return;
    }

    await assignTaskToOperator(requestId, operator.id);
    
    await storage.updatePaymentRequestStatus(requestId, 'processing');

    const user = await storage.getUser(request.userId);
    const amountRub = parseFloat(request.amountRub);
    const amountUsdt = parseFloat(request.amountUsdt);

    await operatorBot!.editMessageText(
      `✅ <b>Заявка взята в работу!</b>\n\n` +
      `🆔 ID: ${requestId.slice(-6)}\n` +
      `👤 Клиент: ${user?.username || 'Неизвестно'}\n` +
      `💵 Сумма: ${amountRub.toLocaleString('ru-RU')} ₽\n` +
      `💎 USDT: ${formatUsdtBalance(amountUsdt).slice(0, -6)} USDT\n\n` +
      `Используйте веб-панель для обработки заявки.`,
      { chat_id: chatId, message_id: messageId, parse_mode: 'HTML' }
    );

    const onlineOperators = await storage.getOnlineOperators();
    const otherOperatorChatIds = onlineOperators
      .filter(op => op.id !== operator.id && op.chatId)
      .map(op => op.chatId!);
    
    await notifyOperatorTaskTaken(otherOperatorChatIds, requestId);

    if (user) {
      await sendNotificationToUser(
        user.telegramId,
        `⏳ <b>Заявка в обработке</b>\n\n` +
        `Ваша заявка №${requestId.slice(-6)} взята в работу оператором.\n` +
        `Ожидайте обработки.`
      );
    }

    await storage.createNotification({
      userId: request.userId,
      requestId: request.id,
      message: `Заявка №${requestId.slice(-6)} взята в работу оператором`,
      isRead: 0,
    });
  } catch (error) {
    console.error('Error in handleTakeTask:', error);
    await operatorBot!.sendMessage(chatId, '❌ Ошибка при взятии заявки в работу');
  }
}

async function handleRejectTask(chatId: string, requestId: string, messageId: number) {
  try {
    const operators = await storage.getAllOperators();
    const operator = operators.find(op => op.chatId === chatId);
    
    if (!operator) {
      await operatorBot!.sendMessage(chatId, '❌ Ошибка: оператор не найден');
      return;
    }

    await operatorBot!.editMessageText(
      `❌ Заявка №${requestId.slice(-6)} отклонена\n\n` +
      `Она останется доступной для других операторов.`,
      { chat_id: chatId, message_id: messageId, parse_mode: 'HTML' }
    );
  } catch (error) {
    console.error('Error in handleRejectTask:', error);
  }
}
