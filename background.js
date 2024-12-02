// 存储选中的数字
let selectedNumber = null;

// 创建上下文菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "calculate",
    title: "使用计算器计算: %s",
    contexts: ["selection"]
  });
});

// 处理上下文菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "calculate") {
    const number = parseFloat(info.selectionText);
    if (!isNaN(number)) {
      selectedNumber = number;
      // 使用 chrome.windows.create 来创建一个新的弹出窗口
      try {
        await chrome.action.openPopup();
      } catch (error) {
        // 如果 openPopup 失败，使用替代方法
        chrome.windows.create({
          url: 'popup.html',
          type: 'popup',
          width: 300,
          height: 400
        });
      }
    }
  }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_SELECTED_NUMBER") {
    try {
      if (selectedNumber !== null) {
        sendResponse({ number: selectedNumber });
        selectedNumber = null; // 清除存储的数字
      } else {
        sendResponse({}); // 发送空响应
      }
    } catch (error) {
      console.error('Error in message handler:', error);
      sendResponse({}); // 发送空响应
    }
    return true; // 表明我们会异步发送响应
  }
});
