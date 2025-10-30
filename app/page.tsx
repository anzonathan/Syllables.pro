"use client";

import Image from "next/image";
import React, { useState } from 'react';

// Types
interface AnalysisResults {
  wordCount: number;
  totalSyllables: number;
  neumernymString: string;
}

// Logic

/** 
 * A basic heuristic to count syllables in a word.
 * This is not dictionary-accurate but serves as a functional prototype.
 * It counts contiguous groups of vowels (a, e, i, o, u, y) as syllables.
 * 
 */
const countSyllables = (word: string): number => {
  let processedWord = word.toLowerCase().replace(/[^a-z]/g, "");
  if (processedWord.length === 0) return 0;

  let count = 0;
  const vowels = "aeiouy";
  let isPrevVowel = false;

  for (let i = 0; i < processedWord.length; i++) {
    const isVowel = vowels.includes(processedWord[i]);
    if (isVowel && !isPrevVowel) {
      count++;
    }
    isPrevVowel = isVowel;
  }

  // Adjust for a common English rule: subtract 1 if the word ends in a silent 'e' and has more than 1 syllable
  if (count > 1 && processedWord.endsWith('e') && !processedWord.endsWith('le')) {
    count--;
  }

  // Ensure minimum of 1 syllable if the word contains vowels
  return Math.max(1, count);
};

/**
 * Generates a neumernym (e.g., 'international' -> 'i11l') for longer words.
 */
const generateNeumernym = (word: string): string => {
    if (word.length <= 4) {
        return word;
    }
    // Only compress if the word consists mainly of letters
    const lettersMatch = word.match(/[a-zA-Z]/g);
    const letters: string[] = lettersMatch || [];

    if (letters.length < 4) {
      let error1 = "To short to compress";
      return error1;
    }

    const first = letters[0];
    const last = letters[letters.length - 1];
    const count = letters.length - 2;
    return `${first}${count}${last}`;
};

// Main component

export default function Home() {
  const [textInput, setTextInput] = useState<string>('');
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAnalyze = () => {
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
        const input = textInput.trim();
        // Clean text: replace punctuation with space and consolidate multiple spaces, then lowercase
        const cleanedText = input.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
                                 .replace(/\s{2,}/g, " ")
                                 .toLowerCase();
        
        // Extract words using regex boundary match
        const wordsMatch = cleanedText.match(/\b\w+\b/g);
        const words: string[] = wordsMatch || [];

        const wordCount: number = words.length;
        let totalSyllables: number = 0;
        const neumernyms: string[] = [];

        words.forEach((word: string) => {
            totalSyllables += countSyllables(word);
            neumernyms.push(generateNeumernym(word));
        });

        setResults({
            wordCount,
            totalSyllables,
            neumernymString: neumernyms.join(' ')
        });
        setIsLoading(false);
    }, 500);
  };

  const isButtonDisabled: boolean = isLoading || textInput.trim().length === 0;

  return (
    <div className="flex min-h-screen items-start justify-center font-sans  transition-colors p-4 sm:p-8">
      <main className="flex w-full max-w-4xl flex-col items-center gap-12 py-12 sm:py-20">

        {/* Header */}
        <div className="flex justify-center py-12 px-4">
            <div className="max-w-2xl w-full text-left">
                
                {/* --- HEADER: Word and Pronunciation --- */}
                <header className="mb-6">
                    <div className="flex items-end gap-2">
                        {/* The Main Word: Bold and Large */}
                        <h1 className="text-4xl font-extrabold text-black dark:text-zinc-50 tracking-tight">
                            **SYL**·LA·BLE
                        </h1>
                        {/* Pronunciation/Phonetics */}
                        <span className="text-xl text-gray-500 dark:text-gray-400 font-serif italic">
                            (sĭl'ə-bəl)
                        </span>
                    </div>
                    
                    {/* Part of Speech */}
                    <span className="text-lg font-semibold text-purple-700 dark:text-purple-500 mt-1 block">
                        *noun*
                    </span>
                    
                    <hr className="mt-3 border-t border-gray-300 dark:border-gray-700" />
                </header>

                {/* --- DEFINITION BLOCK --- */}
                <section className="space-y-4">
                    {/* Definition 1 */}
                    <p className="text-xl leading-relaxed text-zinc-800 dark:text-zinc-200">
                        <span className="font-bold mr-2 text-purple-700 dark:text-purple-500">1.</span> 
                        The **smallest unit of a word** that contains a vowel sound and may contain following consonants; it's the rhythmic division in poetry or spoken language
                        used to create rhythm and cadence.
                    </p>
                    
                    {/* Definition 2 / Usage Note */}
                    <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 mt-2 pl-6 border-l-4 border-gray-200 dark:border-gray-600">
                        <span className="font-bold italic">— Usage:</span> Built for writers, for poets, for Michelle
                    </p>

              
                </section>
                
            </div>
        </div>

        {/* Search Bar & Submission */}
        <div className="w-full flex flex-col gap-4   p-6 sm:p-8 ">
            <h1 className="font-semibold">Input your text here</h1>
            <div className="relative">
              <textarea
                  id="text-input"
                  // min-height for chat-bar feel, max-height for responsive overflow
                  // pr-16 ensures space for the submit button/icon
                  className="w-full min-h-[100px] max-h-[250px] p-4 pr-16 text-lg text-zinc-900 dark:text-zinc-100 bg-gray-100 dark:bg-zinc-700 
                             border-2 border-purple-300 dark:border-purple-700 rounded-xl 
                             focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-600 
                             focus:border-purple-600 dark:focus:border-purple-400 transition-all resize-y 
                             placeholder-zinc-500 dark:placeholder-zinc-400 focus:shadow-lg focus:outline-none"
                  placeholder="Paste your poem, paragraph, or essay here to analyze its word count, syllables, and neumernyms..."
                  value={textInput}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextInput(e.target.value)}
                  disabled={isLoading}
              />
              
              {/* Submission Button positioned inside the textarea area, bottom right */}
              <button
                  className={`absolute bottom-3 right-3 p-2 rounded-full transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-zinc-800 ${
                      isButtonDisabled
                          ? 'bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-400'
                  }`}
                  onClick={handleAnalyze}
                  disabled={isButtonDisabled}
              >
                  {isLoading ? (
                      // Spinner icon
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  ) : (
                      // Send Icon (from Lucide/Heroicons equivalent)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                  )}
              </button>
            </div>
        </div>


        {/* Results Display */}
        {results && (
          <div className="w-full flex flex-col gap-6 bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700">
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
          Analysis Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Card: Word Count */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-xl shadow-md border border-gray-200 dark:border-zinc-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
          {results.wordCount.toLocaleString()}
          </p>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Words</p>
          </div>

          {/* Stat Card: Syllable Count */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-xl shadow-md border border-gray-200 dark:border-zinc-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated</p>
          <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
          {results.totalSyllables.toLocaleString()}
          </p>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Syllables</p>
          </div>

          {/* Stat Card: Average Syllables per Word */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-xl shadow-md border border-gray-200 dark:border-zinc-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average</p>
          <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
          {(results.totalSyllables / (results.wordCount || 1)).toFixed(2)}
          </p>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Syllables/Word</p>
          </div>
          </div>

          {/* Neumernym Output */}
          <div className="mt-4">
          <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 mb-3 flex items-center">
          Neumernym Compression =
          <span className="ml-2 text-xs font-normal text-gray-600 dark:text-gray-400">(First Letter + Count + Last Letter)</span>
          </h3>
          <p className="p-4 bg-gray-100 dark:bg-zinc-700 text-black dark:text-white rounded-xl text-lg font-mono overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-purple-400">
          {results.neumernymString}
          </p>
          </div>

          </div>
          )}
          <footer className="w-full py-6 mt-auto border-t border-gray-200 dark:border-zinc-700 ">
            <div className="container mx-auto px-4">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Syllables.pro  All rights reserved.
                <br/>Developed by <a  href="https://nathanielmugenyi.com"><span className="underline font-semibold hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">Nathaniel Mugenyi</span></a>
              </p>
             
            </div>
          </footer>
                </main>

          
    </div>


  );
}
