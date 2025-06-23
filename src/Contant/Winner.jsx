import { useEffect, useState } from "react";
import { socket } from '../server';
import { useLocation } from 'react-router-dom';

export const Winner = () => {
  const location = useLocation();
  const { roomname } = location.state || {};
  const [winnerName, setWinnerName] = useState("Waiting for result...");

  useEffect(() => {
    if (roomname) {
      socket.emit("get-winner", { roomname });
    }

    socket.on("game-ended", (data) => {
      setWinnerName(data.name);
    });

    return () => {
      socket.off("game-ended");
    };
  }, [roomname]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'url(/background.jpg) center/cover no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Orbitron, sans-serif',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0,0,50,0.6)',
        padding: '5vw',
        borderRadius: '1vw',
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2vh',
        maxWidth: '90%',
        width: '400px'
      }}>
        <h1 style={{ fontSize: '3rem', color: '#00ffcc' }}>Game Over</h1>
        <h2 style={{ fontSize: '2rem', color: '#ffd700' }}>🏆 Winner: {winnerName}</h2>
        <p style={{ fontSize: '1rem', color: '#ccc' }}>Thanks for playing!</p>
        <a href="http://localhost:5173/">wanan play again</a>
      </div>
    </div>
  );
};
