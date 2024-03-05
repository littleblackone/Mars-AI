'use client'
import React, { useState, useEffect } from 'react';
const TypeEffect = () => {
  const carouselText = [
    { text: "a painting of a narrow little alley with flowers beside an ocean" },
    { text: "sunset of kapiti island, Carla Bosch style, insane details" },
    { text: "a futuristic, minimalistic but realistically functional spaceship" },
    { text: "create a caribbean island landscape scene" },
    { text: "a horse running through an open field with a snow capped mountain in the background" }
  ];

  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    const typeAndDelete = async () => {
      const currentText = carouselText[textIndex];
      await typeSentence(currentText.text);
      await waitForMs(500); // Wait for some time before deletion
      await deleteSentence(currentText.text.length);
      await waitForMs(500); // Wait for some time before moving to the next sentence
      setTextIndex((textIndex + 1) % carouselText.length);
    };

    if (hasRendered) {
      typeAndDelete();
    } else {
      setHasRendered(true);
    }
  }, [textIndex, hasRendered]);

  const typeSentence = async (sentence: string) => {
    const letters = sentence.split("");
    for (let i = 0; i < letters.length; i++) {
      await waitForMs(20);
      setDisplayText(prevText => prevText + letters[i]);
    }
  };

  const deleteSentence = async (length: number) => {
    for (let i = 0; i < length; i++) {
      await waitForMs(20);
      setDisplayText(prevText => prevText.slice(0, -1));
    }
  };

  const waitForMs = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  return (
    <div className="typing-container">
      <span id="sentence" className="sentence"></span>
      <span id="feature-text" className='h-[4rem] border-[6px] border-[rgb(121,133,238)] font-medium flex items-center justify-start text-neutral-800 bg-white/80 w-[40rem] p-6 rounded-lg'>{displayText}</span>
      <span className="input-cursor"></span>
    </div>
  );
};

export default TypeEffect;
