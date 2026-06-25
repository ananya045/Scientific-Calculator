# 🧮 Calculator

A modern and responsive web-based Calculator built using **HTML**, **CSS**, and **JavaScript**. The calculator supports basic arithmetic operations, brackets, decimal calculations, and features an attractive Glassmorphism UI design.

## 🚀 Features

- Addition, Subtraction, Multiplication, and Division
- Decimal Number Support
- Bracket Operations `( )`
- Backspace Functionality
- Clear Display Button
- Error Handling for Invalid Expressions
- Responsive Design for Mobile and Desktop
- Modern Glassmorphism User Interface

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS)

## 📂 Project Structure

```
Calculator/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 📋 How It Works

### HTML
- Creates the calculator layout.
- Defines the display screen and buttons.
- Connects CSS and JavaScript files.

### CSS
- Implements Glassmorphism design.
- Adds responsive layout.
- Provides button hover and click effects.
- Uses gradients and shadows for a modern appearance.

### JavaScript
- Handles button clicks.
- Updates calculator display.
- Performs calculations using JavaScript's `eval()` function.
- Supports clear, backspace, and error handling features.

## ⚙️ Functions Used

### appendValue(v)

```javascript
function appendValue(v){
    display.value += v;
}
```

Appends the selected value to the calculator display.

### cleardisplay()

```javascript
function cleardisplay(){
    display.value = "";
}
```

Clears the calculator display.

### backspace()

```javascript
function backspace(){
    display.value = display.value.slice(0,-1);
}
```

Removes the last entered character.

### Calculate()

```javascript
function Calculate(){
    try{
        display.value = eval(display.value);
    }
    catch{
        display.value = "Error";
    }
}
```

Evaluates the mathematical expression and displays the result.

## ▶️ How to Run

1. Download or clone the repository.
2. Open the project folder.
3. Open `index.html` in your browser.

OR

```bash
git clone <repository-url>
cd Calculator
```

Then open `index.html` using Live Server in VS Code.

## ✨ User Interface

- Gradient Background
- Glassmorphism Design
- Responsive Layout
- Interactive Hover Effects
- Modern Button Styling

## 🔮 Future Improvements

- Scientific Calculator Functions
- Keyboard Support
- Calculation History
- Dark/Light Theme Toggle
- Percentage and Square Root Operations

## 👩‍💻 Author

**Ananya**

## 📄 License

This project is open-source and available for learning and educational purposes.
