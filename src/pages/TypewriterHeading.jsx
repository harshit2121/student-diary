import React, { useEffect, useState } from "react";

// Texts to cycle through (English → Hindi)
const TITLES = [
  "School of Excellence ERP by Harshit Parmar",
  "उत्कृष्ट विद्यालय झाबुआ ईआरपी — हर्षित परमार",
];

export default function TypewriterHeading({
  className = "text-2xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] text-indigo",
  typingSpeed = 20,     // ms per character while typing
  eraseSpeed = 30,      // ms per character while erasing
  holdTime = 1500,      // ms to hold full line before erase
  cursorColor = "#fde68a",
}) {
  const [index, setIndex] = useState(0);      // which title
  const [text, setText] = useState("");       // visible substring
  const [phase, setPhase] = useState("typing"); // "typing" | "holding" | "erasing"

  useEffect(() => {
    let t;
    const full = TITLES[index];

    if (phase === "typing") {
      if (text.length < full.length) {
        t = setTimeout(() => setText(full.slice(0, text.length + 1)), typingSpeed);
      } else {
        t = setTimeout(() => setPhase("holding"), holdTime);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("erasing"), 200);
    } else if (phase === "erasing") {
      if (text.length > 0) {
        t = setTimeout(() => setText(full.slice(0, text.length - 1)), eraseSpeed);
      } else {
        setIndex((i) => (i + 1) % TITLES.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, index, typingSpeed, eraseSpeed, holdTime]);

  // Restart text when index changes
  useEffect(() => {
    setText("");
    setPhase("typing");
  }, [index]);

  return (
  <div className={className} aria-live="polite" aria-atomic="true">
    <span className="text-yellow-300">{text}</span>
    <span
      aria-hidden
      className="inline-block ml-[2px] w-[2px] sm:w-[3px] align-middle"
      style={{
        height: "1em",
        backgroundColor: cursorColor || "#fde68a",
        animation: "blink 1s step-end infinite",
      }}
    />
    <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
  </div>
);
}
