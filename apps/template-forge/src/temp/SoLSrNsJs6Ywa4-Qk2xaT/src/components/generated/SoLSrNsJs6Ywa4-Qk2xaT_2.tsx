import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TweetInterface: React.FC = () => {
  const [tweet, setTweet] = useState('');
  const [characterCount, setCharacterCount] = useState(0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setTweet(input);
    setCharacterCount(input.length);
  };

  const handleSubmit = () => {
    // Submit tweet logic
    console.log('Tweet submitted:', tweet);
    setTweet('');
    setCharacterCount(0);
  };

  return (
    <div className="bg-white dark:bg-black px-4 py-6 rounded-lg shadow-lg">
      <Input
        type="text"
        placeholder="What's happening?"
        value={tweet}
        onChange={handleInputChange}
      />
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {characterCount}/280 characters
        </p>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleSubmit}
          disabled={tweet.length === 0}
        >
          Tweet
        </Button>
      </div>
    </div>
  );
};

export default TweetInterface;