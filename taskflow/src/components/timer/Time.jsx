import React, { useEffect, useState, useRef } from 'react';
import { Button, Typography } from 'antd';

const { Title } = Typography;

export default function Time() {
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      const start = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - start);
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    if (!startTime) {
      setStartTime(Date.now());
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  // Format elapsed time to HH:MM:SS
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '30px' }}>
      <Title level={3}>Timer</Title>
      <Title level={2}>{formatTime(elapsed)}</Title>
      <Button type="primary" onClick={handleStart} disabled={isRunning} style={{ marginRight: 10 }}>
        Start
      </Button>
      <Button danger onClick={handleStop} disabled={!isRunning}>
        Stop
      </Button>
    </div>
  );
}
