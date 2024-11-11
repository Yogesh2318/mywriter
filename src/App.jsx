import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState("Random text to type...");
  const [userInput, setUserInput] = useState("");
  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [start, setStart] = useState(false);
  const [highlightedText, setHighlightedText] = useState([]);
  const [accuracy, setAccuracy] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [spm, setSpm] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  
  // Fetch random text
  const getRandomText = async () => {
    try {
      const response = await fetch('https://baconipsum.com/api/?type=all-meat&paras=2');
      const data = await response.json();
      return data.join(' ');
    } catch (error) {
      console.error("Error fetching random text:", error);
      return "Error fetching text. Please try again.";
    }
  };

  useEffect(() => {
    let intervalId;
    if (start) {
      intervalId = setInterval(() => {
        setTime(prevTime => {
          let { hours, minutes, seconds } = prevTime;
          seconds++;
          if (seconds === 60) {
            seconds = 0;
            minutes++;
          }
          if (minutes === 60) {
            minutes = 0;
            hours++;
          }
          return { hours, minutes, seconds };
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [start]);

  // Format time as HH:MM:SS
  const formattedTime = 
    String(time.hours).padStart(2, '0') + ':' +
    String(time.minutes).padStart(2, '0') + ':' +
    String(time.seconds).padStart(2, '0');

  // Start the typing test
  const display = async () => {
    if(time.seconds!=0){
      time.hours=0;
      time.minutes=0;
      time.seconds=0;
    }
    const randomText = await getRandomText();
    setText(randomText);
    setUserInput("");
    setStart(true);
    setIsPopupVisible(false); // Hide popup in case it was shown earlier
  };

  // Stop and calculate accuracy, WPM, SPM
  const display2 = async () => {
    setStart(false);
    let wrong = 0;
    let correct = 0;

    // Count wrong and correct characters
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) {
        correct++;
      } else {
        wrong++;
      }
    }

    // Calculate accuracy
    let accuracyValue = (correct / text.length) * 100;
    setAccuracy(accuracyValue.toFixed(2));

    // Calculate words per minute (assuming 5 characters per word)
    if (time.minutes !== 0) {
      let wordsPerMinute = (userInput.length / 5) / time.minutes;
      setWpm(wordsPerMinute.toFixed(2));
    } else if (time.minutes === 0 && time.seconds !== 0) {
      let charsPerSecond = userInput.length / time.seconds;
      setSpm(charsPerSecond.toFixed(2));
    }

    // Show the popup
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false); // Hide popup
  };

  const handleInputChange = (e) => {
    const currentValue = e.target.value;
    setUserInput(currentValue);

    // If the user finishes typing, stop the timer
    if (currentValue.length === text.length) {
      display2();
    }
  };

  useEffect(() => {
    const newHighlightedText = [];
    let wrong = 0; // Reset wrong count each time

    for (let i = 0; i < text.length; i++) {
      if (i < userInput.length) {
        if (text[i] === userInput[i]) {
          newHighlightedText.push(
            <span key={i} style={{ color: 'green' }}>
              {text[i]}
            </span>
          );
        } else {
          wrong++;
          newHighlightedText.push(
            <span key={i} style={{ color: 'red' }}>
              {text[i]}
            </span>
          );
        }
      } else {
        newHighlightedText.push(
          <span key={i} style={{ color: 'white' }}>
            {text[i]}
          </span>
        );
      }
    }
    setHighlightedText(newHighlightedText);
  }, [userInput, text]);

  return (
    <>
      <div className='display'>
        <div id='clock'>{formattedTime}</div>
        <p id='dis'>{highlightedText}</p> {/* Render highlighted text */}
        <button onClick={display}>Create</button>
        <button onClick={display2}>Stop</button>
        <div id="in">
          <textarea
            value={userInput}
            rows="10"
            cols="50"
            onChange={handleInputChange}
            style={{ resize: 'none', width: '100%' }}
          />
        </div>
      </div>

      {isPopupVisible && (
        <div className="popup">
          <div className="popup-content">
            <h2>Typing Results</h2>
            <p>Accuracy: {accuracy}%</p>
            <p>Words Per Minute (WPM): {wpm}</p>
            <p>Characters Per Second (SPM): {spm}</p>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
