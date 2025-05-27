import React, { useState, useEffect } from "react";

// Pomodoro Timer
function Pomodoro() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev === 0) {
            if (!isBreak) {
              setIsBreak(true);
              return 5 * 60;
            } else {
              setIsBreak(false);
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isBreak]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold text-[#265B63] mb-2">Pomodoro Timer</h3>
      <div className="text-5xl font-mono mb-2">{minutes}:{seconds}</div>
      <div className="mb-2 text-sm">{isBreak ? "Break Time!" : "Focus Time"}</div>
      <div className="flex space-x-2">
        <button onClick={() => setIsRunning(true)} className="bg-green-500 text-white px-3 py-1 rounded">Start</button>
        <button onClick={() => setIsRunning(false)} className="bg-yellow-500 text-white px-3 py-1 rounded">Pause</button>
        <button onClick={() => { setIsRunning(false); setIsBreak(false); setSecondsLeft(25 * 60); }} className="bg-gray-300 text-[#265B63] px-3 py-1 rounded">Reset</button>
      </div>
    </div>
  );
}

// Stopwatch with persistent accumulated time
function Stopwatch({ accumulated, setAccumulated, setExtraTime, closeModal }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Start/stop timer
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Live update for dashboard
  useEffect(() => {
    if (setExtraTime) setExtraTime(seconds);
  }, [seconds, setExtraTime]);

  // Commit time on reset
  const commitTime = () => {
    setAccumulated(prev => prev + seconds);
    setSeconds(0);
    if (setExtraTime) setExtraTime(0);
  };

  // On close (cross), commit any running time and close
  const handleClose = () => {
    setAccumulated(prev => prev + seconds);
    setSeconds(0);
    if (setExtraTime) setExtraTime(0);
    closeModal();
  };

  const total = accumulated + seconds;
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const secs = String(total % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center relative">
      <h3 className="text-lg font-bold text-[#265B63] mb-2">Stopwatch</h3>
      <div className="text-5xl font-mono mb-2">{hours}:{minutes}:{secs}</div>
      <div className="flex space-x-2">
        <button onClick={() => setIsActive(true)} className="bg-green-500 text-white px-3 py-1 rounded">Start</button>
        <button onClick={() => setIsActive(false)} className="bg-yellow-500 text-white px-3 py-1 rounded">Pause</button>
        <button onClick={commitTime} className="bg-gray-300 text-[#265B63] px-3 py-1 rounded">Reset</button>
      </div>
      <button
        className="absolute top-2 right-3 text-gray-400 hover:text-gray-700"
        onClick={handleClose}
        title="Close"
      >✕</button>
    </div>
  );
}

export default function TimerModal({ setExtraTime, stopwatchAccumulated, setStopwatchAccumulated }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-2 flex flex-col items-end space-y-2">
          <button
            className="bg-[#265B63] hover:bg-[#1d474d] text-[#CAB964] rounded-full p-3 shadow-lg flex items-center"
            onClick={() => setMode("pomodoro")}
          >
            <span className="mr-2">🍅</span> Pomodoro
          </button>
          <button
            className="bg-[#265B63] hover:bg-[#1d474d] text-[#CAB964] rounded-full p-3 shadow-lg flex items-center"
            onClick={() => setMode("stopwatch")}
          >
            <span className="mr-2">⏱️</span> Stopwatch
          </button>
        </div>
      )}
      {mode === "pomodoro" && (
        <div className="fixed bottom-24 right-8 bg-white shadow-xl rounded-lg p-6 z-50 w-72">
          <button className="absolute top-2 right-3 text-gray-400 hover:text-gray-700" onClick={() => setMode(null)}>✕</button>
          <Pomodoro />
        </div>
      )}
      {mode === "stopwatch" && (
        <div className="fixed bottom-24 right-8 bg-white shadow-xl rounded-lg p-6 z-50 w-72">
          <Stopwatch
            accumulated={stopwatchAccumulated}
            setAccumulated={setStopwatchAccumulated}
            setExtraTime={setExtraTime}
            closeModal={() => setMode(null)}
          />
        </div>
      )}
      <button
        className="bg-[#265B63] hover:bg-[#1d474d] text-[#CAB964] rounded-full p-5 shadow-2xl text-2xl transition"
        onClick={() => setOpen((v) => !v)}
        title="Open Timer Widgets"
      >
        {open ? "✕" : "⏰"}
      </button>
    </div>
  );
}
