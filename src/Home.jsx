import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { socket } from './server';

export const RoomManager = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const [myname, setMyname] = useState(socket.id);
  const [room, setRoom] = useState({});
  const [colors, setColors] = useState({ red: 0, green: 0, yellow: 0, blue: 0, black: 0, white: 0 });
  const [changeName, setChangeName] = useState("player0");
  const [changetime, setChangetime] = useState(2);
  const [map, setMap] = useState(0);

  useEffect(() => {
    socket.on('room-update', (room) => {
      setPlayers(room.players);
      setGameStarted(room.started);
      setRoom(room);
      setColors(room.colors);
      setMap(room.map);
      setIsCreator(room.creator);
    });

    socket.on('game-started', () => {
      setGameStarted(true);
    });

    return () => {
      socket.off('room-update');
      socket.off('game-started');
    };
  }, []);

  useEffect(() => {
    if (gameStarted) {
      room["myname"] = myname;
      navigate("/game", { state: [room, map] });
    }
  }, [gameStarted]);

  const handleCreate = () => {
    socket.emit('create-room', { roomName, password }, (response) => {
      if (response.success) {
        setMyname(response.name);
        setIsCreator(response.creator);
        setInRoom(true);
        setError('');
      } else {
        setError(response.message);
      }
    });
  };

  const handleJoin = () => {
    socket.emit('join-room', { roomName, password }, (response) => {
      if (response.success) {
        setMyname(response.name);
        setIsCreator(response.creator);
        setInRoom(true);
        setError('');
      } else {
        setError(response.message);
      }
    });
  };

  const handleStart = () => {
    socket.emit('start-game', roomName);
  };

  const Colorhandle = (value) => {
    socket.emit('color-selection', { roomName, value, myname });
  };

  const handleName = () => {
    socket.emit("name-changed", { changeName, myname, roomName });
  };

  const handleMap = (v) => {
    socket.emit("select-map", { roomName, v });
    setMap(v);
  };

  const handletime = (v) => {
    socket.emit("time", { roomName, time: v });
    setChangetime(v);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'brown',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Orbitron, sans-serif',
      color: '#fff',
      position:"absolute",
      top:"0",
      left:"0",
    }}>
      {!inRoom ? (
        <div style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(0,0,50,0.6)',
          padding: '4vw',
          borderRadius: '1vw',
          display: 'flex',
          flexDirection: 'column',
          gap: '2vh',
          width: '90%',
          maxWidth: '400px',
        }}>
          <h2 style={{ textAlign: 'center', color: '#ffd700' }}>Join or Create a Room</h2>
          <input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            style={{ padding: '1vh', borderRadius: '0.5vw', border: 'none', width: '100%' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '1vh', borderRadius: '0.5vw', border: 'none', width: '100%' }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <button onClick={handleCreate} style={buttonStyle}>Create</button>
            <button onClick={handleJoin} style={buttonStyle}>Join</button>
          </div>
        </div>
      ) : (
        <div style={{
          width: '95%',
          height: '95%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: '1vw',
          padding: '2vw',
          display: 'flex',
          flexDirection: 'column',
          gap: '2vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <h2>Room: {roomName}</h2>
              <h3>You: {changeName}</h3>
            </div>
            <div>
              <input value={changeName} onChange={(e) => setChangeName(e.target.value)} />
              <button onClick={handleName} style={buttonStyleSmall}>Change</button>
            </div>
          </div>

          <div>
            <p>{gameStarted ? 'Game Started' : 'Waiting to Start...'}</p>
            <p>Players ({players.length}/6):</p>
            <ul>{players.map(p => (
              <li key={p}>{room.detalis?.[p]?.name || 'Unknown'}</li>
            ))}</ul>
          </div>

          <div>
            <p>Select Your Color:</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {Object.keys(colors).map(color => (
                <button key={color} onClick={() => Colorhandle(color)} style={{
                  backgroundColor: color,
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid white',
                  cursor: 'pointer'
                }} />
              ))}
            </div>
          </div>

          {isCreator && (isCreator==myname) && !gameStarted && (
            <>
              
              <p>Select the map:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1vw', marginTop: '2vh' }}>
                {['Castle', 'Night Castle', 'Bookland', 'Night Bookland'].map((m, i) => (
                  <button key={i} onClick={() => handleMap(i)} style={buttonStyleSmall}>{m}</button>
                ))}
              </div>
              <p>Select the duration:</p>
              <div style={{ display: 'flex', gap: '1vw', marginTop: '2vh' }}>
                {[1, 2, 5, 7].map(t => (
                  <button key={t} onClick={() => handletime(t)} style={buttonStyleSmall}>{t} min</button>
                ))}
              </div>
              <button onClick={handleStart} style={{width:"30vw",height:"10vh",marginLeft:"30vw",borderRadius:"2vw",color:"whitesmoke",backgroundColor:"brown",fontSize:"2vw"}}>Start Game</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: '1vh 2vw',
  backgroundColor: '#0066ff',
  border: 'none',
  borderRadius: '1vw',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
  cursor: 'pointer'
};

const buttonStyleSmall = {
  ...buttonStyle,
  padding: '0.5vh 1.5vw',
  fontSize: '0.9rem'
};
