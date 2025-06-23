import { useState } from "react";
import "./PlayerInfo.css";
import { useRef,useEffect } from "react";
import { socket } from "../server";
import { useNavigate } from "react-router-dom";
export const PlayerInfo = ({room}) => {
   const navigate = useNavigate();
    const [m,setM]=useState(room.time-1);
    const [s,setS]=useState(59);
    const [target,setTarget]=useState(room.target);
    const [details,setDetails]=useState(room);
    const [score,setScore]=useState(0);
    const [check,setCheck]=useState("❌ scored");
    useEffect(() => {
    const interval = setInterval(() => {
      const sec=s-1;
      if(sec<0){

        if (m-1<0){
         navigate("/winner", { state: { roomname: room.roomname } });
        }
        setM(m-1);
        setS(59);
      }
      else{
       
        setS(sec);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [s]);
    useEffect(() => {
  const updateRoom = (data) => {
    const newTarget = data.target;
    const newScore = data.detalis[socket.id].score;

    // Reset check if target changed
    if (newTarget !== target) {
      setCheck("❌ scored");
      setTarget(newTarget);
    }

    // Detect score increment
    if (newScore > score) {
      setCheck("✅ Scored!");
    }

    setScore(newScore);
    setDetails(data);
  };

  socket.on('room-update', updateRoom);
  return () => socket.off('room-update', updateRoom);
}, [target, score]);


  const intervalRef = useRef(null);

  const startKeyPress = (key, codeOverride) => {
    dispatchKey("keydown", key, codeOverride);

    intervalRef.current = setInterval(() => {
      dispatchKey("keydown", key, codeOverride);
    }, 100);
  };

  const stopKeyPress = (key, codeOverride) => {
    clearInterval(intervalRef.current);
    dispatchKey("keyup", key, codeOverride);
  };

  const dispatchKey = (type, key, codeOverride) => {
    const code = codeOverride || `Key${key.toUpperCase()}`;
    const keyCode = key === " " ? 32 : key.charCodeAt(0);

    const event = new KeyboardEvent(type, {
      key: key,
      code: code,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
    });

    document.dispatchEvent(event);
  };

  const renderControlButton = (key, label = key.toUpperCase(), codeOverride) => (
    <button
    key={key}
      className={label}
      onMouseDown={() => startKeyPress(key, codeOverride)}
      onMouseUp={() => stopKeyPress(key, codeOverride)}
      onMouseLeave={() => stopKeyPress(key, codeOverride)}
      onTouchStart={() => startKeyPress(key, codeOverride)}
      onTouchEnd={() => stopKeyPress(key, codeOverride)}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="score">score : {score}</div>
      <div className="check">{check}</div>
      <div className="timing">{m}:{s}</div>
      <div className="target" >target: <br /> <div style={{color:`${target}`,backgroundColor:"wheat",width:"10vw",borderRadius:"12vw",textAlign:"center"}}>{target}</div></div>
      <div className="controls_1">
        {["w", "s", "d", "a"].map((key) => renderControlButton(key))}
      </div>
      <div className="controls_2">
        {renderControlButton(" ", "Jump", "Space")}
      </div>
    </>
  );
};
