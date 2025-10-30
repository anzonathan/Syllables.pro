"use client"

import Image from "next/image";
import { useState, useMemo } from 'react';

// --- Analysis Logic (Implemented inside the component for single-file mandate) ---

/**
 * A basic heuristic to count syllables in a word.
 * This is not dictionary-accurate but serves as a functional prototype.
 * It counts contiguous groups of vowels (a, e, i, o, u, y) as syllables.
 */
const countSyllables = (word) => {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length === 0) return 0;

  let count = 0;
  const vowels = "aeiouy";
  let isPrevVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !isPrevVowel) {
      count++;
    }
    isPrevVowel = isVowel;
  }

  // Adjust for a common English rule: subtract 1 if the word ends in a silent 'e' and has more than 1 syllable
  if (count > 1 && word.endsWith('e') && !word.endsWith('le')) {
    count--;
  }

  // Ensure minimum of 1 syllable if the word contains vowels
  return Math.max(1, count);
};

/**
 * Generates a neumernym (e.g., 'international' -> 'i11l') for longer words.
 */
const generateNeumernym = (word) => {
    if (word.length <= 4) {
        return word;
    }
    // Only compress if the word consists mainly of letters
    const letters = word.match(/[a-zA-Z]/g);
    if (!letters || letters.length < 4) {
      return word;
    }

    const first = letters[0];
    const last = letters[letters.length - 1];
    const count = letters.length - 2;
    return `${first}${count}${last}`;
};

// --- Main React Component ---

export default function Home() {
  const [textInput, setTextInput] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = () => {
    setIsLoading(true);
    // Simulate API call delay (optional, remove for instant response)
    setTimeout(() => {
        const input = textInput.trim();
        const cleanedText = input.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").replace(/\s{2,}/g, " ").toLowerCase();
        // Match words that are not just whitespace
        const words = cleanedText.match(/\b\w+\b/g) || [];

        const wordCount = words.length;
        let totalSyllables = 0;
        const neumernyms = [];

        words.forEach(word => {
            totalSyllables += countSyllables(word);
            neumernyms.push(generateNeumernym(word));
        });

        setResults({
            wordCount,
            totalSyllables,
            neumernymString: neumernyms.join(' ')
        });
        setIsLoading(false);
    }, 500); // 500ms delay to show loading state
  };

  const isButtonDisabled = isLoading || textInput.trim().length === 0;

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 font-sans dark:bg-zinc-900 transition-colors p-4 sm:p-8">
      <main className="flex w-full max-w-4xl flex-col items-center gap-12 py-12 sm:py-20">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
            {/* Using Next.js logo as a temporary placeholder for a custom Syllables.pro logo 
            <Image
                className="dark:invert mb-2"
                src="/next.svg"
                alt="Syllables.pro Logo Placeholder"
                width={80}
                height={16}
                priority
            />*/}
            <h1 className="text-5xl font-extrabold leading-tight tracking-tighter text-black dark:text-zinc-50 sm:text-6xl">
                Syllables.<span className="text-indigo-600 dark:text-indigo-400">pro</span>
            </h1>
            <p className="max-w-xl text-lg leading-7 text-zinc-600 dark:text-zinc-400 mt-2">
                For writers, for poets, for Michelle
            </p>
        </div>

        {/* LLM-like Search Bar & Submission */}
        <div className="w-full flex flex-col gap-4 bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl transition-shadow hover:shadow-2xl border border-gray-200 dark:border-zinc-700">
            <label htmlFor="text-input" className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                Input your text here (like an LLM prompt):
            </label>
            <textarea
                id="text-input"
                className="w-full min-h-[150px] p-4 text-lg text-black dark:text-white bg-gray-100 dark:bg-zinc-700 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all resize-y placeholder-zinc-500 dark:placeholder-zinc-400"
                placeholder="Paste your poem, paragraph, or essay here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isLoading}
            />

            <button
                className={`w-full sm:w-auto self-end px-8 py-3 text-lg font-bold rounded-xl transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                    isButtonDisabled
                        ? 'bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400'
                }`}
                onClick={handleAnalyze}
                disabled={isButtonDisabled}
            >
                {isLoading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </span>
                ) : (
                    "Submit for Analysis"
                )}
            </button>
        </div>

        {/* Results Display */}
        {results && (
            <div className="w-full flex flex-col gap-6 bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700">
                <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    Analysis Results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card: Word Count */}
                    <div className="flex flex-col p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl shadow-md">
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Total</p>
                        <p className="text-4xl font-extrabold text-indigo-800 dark:text-indigo-200 mt-1">
                            {results.wordCount.toLocaleString()}
                        </p>
                        <p className="text-lg font-medium text-indigo-600 dark:text-indigo-300">Words</p>
                    </div>

                    {/* Stat Card: Syllable Count */}
                    <div className="flex flex-col p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl shadow-md">
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Estimated</p>
                        <p className="text-4xl font-extrabold text-indigo-800 dark:text-indigo-200 mt-1">
                            {results.totalSyllables.toLocaleString()}
                        </p>
                        <p className="text-lg font-medium text-indigo-600 dark:text-indigo-300">Syllables</p>
                    </div>

                    {/* Stat Card: Average Syllables per Word */}
                    <div className="flex flex-col p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl shadow-md">
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Average</p>
                        <p className="text-4xl font-extrabold text-indigo-800 dark:text-indigo-200 mt-1">
                            {(results.totalSyllables / (results.wordCount || 1)).toFixed(2)}
                        </p>
                        <p className="text-lg font-medium text-indigo-600 dark:text-indigo-300">Syllables/Word</p>
                    </div>
                </div>

                {/* Neumernym Output */}
                <div className="mt-4">
                    <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 mb-3 flex items-center">
                        Neumernym Compression (A11y/Initialism)
                        <span className="ml-2 text-xs font-normal text-indigo-500 dark:text-indigo-400">(First Letter + Count + Last Letter)</span>
                    </h3>
                    <p className="p-4 bg-gray-100 dark:bg-zinc-700 text-black dark:text-white rounded-xl text-lg font-mono overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-indigo-400">
                        {results.neumernymString}
                    </p>
                </div>

            </div>
        )}
      </main>
    </div>
  );
}
