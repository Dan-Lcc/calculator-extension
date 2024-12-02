document.addEventListener('DOMContentLoaded', function() {
    const result = document.getElementById('result');
    const expression = document.getElementById('expression');
    let currentInput = '';
    let previousInput = '';
    let operation = null;
    let shouldResetScreen = false;

    // 尝试获取选中的数字
    try {
        chrome.runtime.sendMessage({ type: "GET_SELECTED_NUMBER" }, (response) => {
            if (chrome.runtime.lastError) {
                // 忽略错误，使用默认值
                return;
            }
            if (response && response.number !== undefined) {
                currentInput = response.number.toString();
                updateDisplay();
            }
        });
    } catch (error) {
        console.log('Error getting selected number:', error);
    }

    // 添加按钮点击事件
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;

            if (button.classList.contains('number')) {
                if (shouldResetScreen) {
                    currentInput = value;
                    shouldResetScreen = false;
                } else {
                    currentInput += value;
                }
                updateDisplay();
            } else if (button.classList.contains('operator')) {
                handleOperator(value);
            } else if (button.classList.contains('equals')) {
                calculate();
            } else if (button.classList.contains('clear')) {
                clear();
            } else if (button.classList.contains('delete')) {
                deleteLastChar();
            } else if (button.classList.contains('decimal')) {
                handleDecimal();
            }
        });
    });

    // 添加键盘支持
    document.addEventListener('keydown', (event) => {
        if (event.key >= '0' && event.key <= '9') {
            if (shouldResetScreen) {
                currentInput = event.key;
                shouldResetScreen = false;
            } else {
                currentInput += event.key;
            }
            updateDisplay();
        } else if (['+', '-', '*', '/'].includes(event.key)) {
            handleOperator(event.key);
        } else if (event.key === 'Enter') {
            calculate();
        } else if (event.key === 'Escape') {
            clear();
        } else if (event.key === 'Backspace') {
            deleteLastChar();
        } else if (event.key === '.') {
            handleDecimal();
        }
    });

    function updateDisplay() {
        result.value = currentInput || '0';
        if (previousInput && operation) {
            expression.value = `${previousInput} ${operation}`;
        } else {
            expression.value = '';
        }
    }

    function handleOperator(op) {
        if (currentInput === '') {
            if (previousInput !== '') {
                operation = op;
                updateDisplay();
            }
            return;
        }
        
        if (previousInput !== '') {
            calculate();
        }
        operation = op;
        previousInput = currentInput;
        currentInput = '';
        updateDisplay();
    }

    function calculate() {
        if (previousInput === '' || currentInput === '') return;
        let computation;
        // 使用 BigInt 或更大精度的计算方式
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        
        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    alert('Cannot divide by zero');
                    clear();
                    return;
                }
                // 提高除法精度
                computation = (prev / current);
                // 处理小数位数
                if (computation.toString().includes('.')) {
                    const decimalPlaces = 10;
                    computation = parseFloat(computation.toFixed(decimalPlaces));
                    // 移除末尾的0
                    computation = parseFloat(computation);
                }
                break;
            default:
                return;
        }

        // 显示完整表达式在上面的显示区
        expression.value = `${previousInput} ${operation} ${currentInput} =`;
        
        currentInput = computation.toString();
        operation = null;
        previousInput = '';
        shouldResetScreen = true;
        result.value = currentInput;
    }

    function clear() {
        currentInput = '';
        previousInput = '';
        operation = null;
        expression.value = '';
        result.value = '0';
    }

    function handleDecimal() {
        if (!currentInput.includes('.')) {
            currentInput = currentInput === '' ? '0.' : currentInput + '.';
            updateDisplay();
        }
    }

    function deleteLastChar() {
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            if (currentInput === '') {
                currentInput = '0';
                shouldResetScreen = true;
            }
            updateDisplay();
        }
    }
});
