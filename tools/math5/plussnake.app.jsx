
        const { useState, useEffect, useRef } = React;

        // --- SVG Icons Components (Ocean Themed) ---
        const Anchor = ({ size = 24, className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="22" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
        );
        const Fish = ({ size = 24, className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6.5 12c.94-3.46 4.96-6 8.5-6 3.54 0 6.5 3 6.5 3-5 1.5-5 5.5-5 5.5 0 0 0 4 5 5.5 0 0-2.96 3-6.5 3-3.54 0-7.56-2.54-8.5-6Z"/><path d="M6 12c-3.23 0-5 2.5-5 2.5S2 13 2 12s-1-2.5-1-2.5S2.77 12 6 12Z"/></svg>
        );
        const RotateCcw = ({ size = 24, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
        const Clock = ({ size = 24, className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        );
        const Treasure = ({ size = 24, className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m19 6-3-2L4 7v13l16 1V6Z"/><path d="M4 7h16"/><path d="m16 4-3-2-2 1"/><path d="M4 7v-1l16-1v1"/></svg>
        );

        // --- GAME CONSTANTS ---
        const AVATARS = ['🐙', '🧜‍♀️', '🐡', '🦀', '🦈', '🐢', '🦐', '🚤'];
        const BOARD_SIZE = 100;
        const WHIRLPOOLS = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
        const CURRENTS = { 3: 22, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };
        const QUESTION_TIME_LIMIT = 25;

        // --- MATH GENERATOR ---
        const generateMathQuestion = () => {
            const isAddition = Math.random() > 0.5;
            let num1, num2, correctAnswer, opSymbol;

            if (isAddition) {
                num1 = Math.floor(Math.random() * 90) + 10; // 10 to 99
                num2 = Math.floor(Math.random() * 9) + 1;   // 1 to 9
                correctAnswer = num1 + num2;
                opSymbol = '+';
            } else {
                num1 = Math.floor(Math.random() * 10); // 0 to 9
                num2 = Math.floor(Math.random() * (num1 + 1)); // 0 to num1
                correctAnswer = num1 - num2;
                opSymbol = '-';
            }

            const questionText = `${num1} ${opSymbol} ${num2} = ?`;

            const wrongOptions = new Set();
            while (wrongOptions.size < 3) {
                let fake;
                if (Math.random() > 0.5) {
                    fake = correctAnswer + Math.floor(Math.random() * 5) + 1;
                } else {
                    fake = correctAnswer - Math.floor(Math.random() * 5) - 1;
                }
                if (fake >= 0 && fake !== correctAnswer) {
                    wrongOptions.add(fake);
                }
            }

            const options = [{ value: correctAnswer, isCorrect: true }, ...Array.from(wrongOptions).map(val => ({ value: val, isCorrect: false }))];
            
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }

            return { questionText, options };
        };

        const getBoardCoordinates = (number) => {
            const rowFromBottom = Math.floor((number - 1) / 10);
            const visualRow = 9 - rowFromBottom; 
            const isEvenRowFromBottom = rowFromBottom % 2 === 0;
            const col = isEvenRowFromBottom ? (number - 1) % 10 : 9 - ((number - 1) % 10);
            return { x: col * 10 + 5, y: visualRow * 10 + 5 };
        };

        // --- MAIN COMPONENT ---
        function OceanMathExplorer() {
            const [gameState, setGameState] = useState('setup'); 
            const [numPlayers, setNumPlayers] = useState(2);
            const [players, setPlayers] = useState([
                { name: '', id: 0, avatar: '🐙', position: 1 },
                { name: '', id: 1, avatar: '🧜‍♀️', position: 1 }
            ]);
            const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
            const [diceValue, setDiceValue] = useState(1);
            const [isRolling, setIsRolling] = useState(false);
            const [isMoving, setIsMoving] = useState(false);
            const [isTurnSwitching, setIsTurnSwitching] = useState(false); 
            const [message, setMessage] = useState('Welcome to the Reef!');
            const [showQuestion, setShowQuestion] = useState(false);
            const [currentQuestion, setCurrentQuestion] = useState(null);
            const [pendingMove, setPendingMove] = useState(null);
            const [diceTransform, setDiceTransform] = useState('rotateX(0deg) rotateY(0deg)');
            const [timer, setTimer] = useState(QUESTION_TIME_LIMIT);
            const timerRef = useRef(null);

            const showTurnAlert = (player) => {
                Swal.fire({
                    title: `It's ${player.name}'s Turn!`,
                    html: `
                        <div class="flex flex-col items-center">
                            <div class="text-6xl mb-4 animate-bounce">${player.avatar}</div>
                            <div class="text-2xl font-bold text-sky-600 fun-font">${player.name}</div>
                            <p class="text-sm mt-2 text-sky-400 italic">Ready to dive?</p>
                        </div>
                    `,
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'swal-ocean-popup',
                        title: 'swal-ocean-title'
                    },
                    backdrop: `rgba(0,0,0,0.4)`
                });
            };

            const updateNumPlayers = (n) => {
                setNumPlayers(n);
                setPlayers(prev => {
                    const newPlayers = [...prev];
                    if (n > prev.length) {
                        for (let i = prev.length; i < n; i++) {
                            newPlayers.push({ name: '', id: i, avatar: AVATARS[i % AVATARS.length], position: 1 });
                        }
                    }
                    return newPlayers.slice(0, n);
                });
            };

            const handleNameChange = (idx, val) => {
                setPlayers(prev => prev.map((p, i) => i === idx ? { ...p, name: val } : p));
            };

            const cycleAvatar = (idx, direction) => {
                setPlayers(prev => prev.map((p, i) => {
                    if (i !== idx) return p;
                    let currentAvatarIdx = AVATARS.indexOf(p.avatar);
                    if (direction === 'next') currentAvatarIdx = (currentAvatarIdx + 1) % AVATARS.length;
                    else currentAvatarIdx = (currentAvatarIdx - 1 + AVATARS.length) % AVATARS.length;
                    return { ...p, avatar: AVATARS[currentAvatarIdx] };
                }));
            };

            const startGame = () => {
                const finalPlayers = players.map((p, i) => ({
                    ...p,
                    name: p.name.trim() || `Diver ${i + 1}`,
                    position: 1
                }));
                setPlayers(finalPlayers);
                setGameState('playing');
                setMessage(`${finalPlayers[0].name}'s Turn`);
                setDiceTransform('rotateX(0deg) rotateY(0deg)');
                showTurnAlert(finalPlayers[0]);
            };

            // Game Logic
            const rollDice = async () => {
                if (isRolling || isMoving || showQuestion || isTurnSwitching) return;
                setIsRolling(true);
                setMessage('Rolling bubbles...');
                
                setTimeout(() => {
                    const finalRoll = Math.floor(Math.random() * 6) + 1;
                    setDiceValue(finalRoll);
                    setIsRolling(false);
                    
                    let rotateX = 0, rotateY = 0;
                    switch(finalRoll) {
                        case 1: rotateX = 0; rotateY = 0; break;
                        case 6: rotateX = 180; rotateY = 0; break; 
                        case 2: rotateX = -90; rotateY = 0; break; 
                        case 5: rotateX = 90; rotateY = 0; break; 
                        case 3: rotateX = 0; rotateY = -90; break; 
                        case 4: rotateX = 0; rotateY = 90; break; 
                    }
                    setDiceTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);

                    setTimeout(() => {
                        startMovement(finalRoll);
                    }, 500);
                    
                }, 800); 
            };

            // Event Listener for Spacebar
            useEffect(() => {
                const handleKeyDown = (e) => {
                    if (e.code === 'Space') {
                        e.preventDefault(); 
                        if (!isRolling && !isMoving && !showQuestion && !isTurnSwitching && gameState === 'playing') {
                            rollDice();
                        }
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, [isRolling, isMoving, showQuestion, isTurnSwitching, gameState, currentPlayerIdx, players]); 

            // Timer Logic
            useEffect(() => {
                if (showQuestion) {
                    setTimer(QUESTION_TIME_LIMIT);
                    timerRef.current = setInterval(() => {
                        setTimer((prev) => {
                            if (prev <= 1) {
                                clearInterval(timerRef.current);
                                handleAnswer(false);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                } else {
                    clearInterval(timerRef.current);
                }
                return () => clearInterval(timerRef.current);
            }, [showQuestion]);

            const startMovement = (steps) => {
                setIsMoving(true);
                const player = players[currentPlayerIdx];
                let path = [];
                let current = player.position;
                for (let i = 0; i < steps; i++) {
                    if (current < BOARD_SIZE) current++;
                    else current--;
                    path.push(current);
                }
                let stepIndex = 0;
                const walk = () => {
                    if (stepIndex >= path.length) {
                        handleLanding(path[path.length - 1]);
                        return;
                    }
                    const nextPos = path[stepIndex];
                    setPlayers(prev => prev.map((p, i) => i === currentPlayerIdx ? { ...p, position: nextPos } : p));
                    stepIndex++;
                    setTimeout(walk, 300);
                };
                walk();
            };

            const handleLanding = (pos) => {
                if (pos === BOARD_SIZE) {
                    setGameState('winner');
                    setIsMoving(false);
                    return;
                }
                if (CURRENTS[pos]) {
                    setMessage(`🌊 Strong Current! Solve to ride it to ${CURRENTS[pos]}`);
                    setPendingMove(CURRENTS[pos]);
                    setCurrentQuestion(generateMathQuestion());
                    setTimeout(() => setShowQuestion(true), 500);
                    setIsMoving(false);
                } else if (WHIRLPOOLS[pos]) {
                    setMessage(`🌪️ Whirlpool! Sucked down to ${WHIRLPOOLS[pos]}`);
                    setTimeout(() => {
                        updatePlayerPosition(WHIRLPOOLS[pos], true, `Oh no! Spun down to ${WHIRLPOOLS[pos]}`);
                        setIsMoving(false);
                    }, 1000);
                } else {
                    setMessage(`Exploring Reef ${pos}`);
                    setIsMoving(false);
                    setIsTurnSwitching(true); 
                    endTurn();
                }
            };

            const updatePlayerPosition = (pos, endTurnFlag = true, msg = '') => {
                setPlayers(prev => prev.map((p, i) => i === currentPlayerIdx ? { ...p, position: pos } : p));
                if (msg) setMessage(msg);
                if (endTurnFlag) {
                    setIsTurnSwitching(true); 
                    endTurn();
                }
            };

            const endTurn = () => {
                setTimeout(() => {
                    const nextIdx = (currentPlayerIdx + 1) % players.length;
                    setCurrentPlayerIdx(nextIdx);
                    setMessage(`${players[nextIdx].name}'s Turn`);
                    showTurnAlert(players[nextIdx]);
                    setIsTurnSwitching(false); 
                }, 1500);
            };

            const handleAnswer = (isCorrect) => {
                setShowQuestion(false);
                if (isCorrect) {
                    setMessage('✅ Correct! Riding the Current!');
                    Swal.fire({
                        icon: 'success',
                        title: 'Super!',
                        text: 'You ride the current forward!',
                        customClass: { popup: 'swal-ocean-popup' },
                        timer: 1500,
                        showConfirmButton: false
                    });
                    
                    // --- CHANGED: Increased delay to 2000ms to allow user to see the jump ---
                    setTimeout(() => {
                        updatePlayerPosition(pendingMove, true);
                    }, 2000); 

                } else {
                    setMessage('❌ Oops! The current was too strong.');
                    Swal.fire({
                        icon: 'error',
                        title: 'Missed it!',
                        text: 'You stay where you are.',
                        customClass: { popup: 'swal-ocean-popup' },
                        timer: 1500,
                        showConfirmButton: false
                    });
                    // Added small delay for consistency and to ensure state updates smoothly
                    setTimeout(() => {
                        setIsTurnSwitching(true);
                        endTurn();
                    }, 1500);
                }
            };

            const resetGame = () => {
                setGameState('setup');
                setCurrentPlayerIdx(0);
                setDiceValue(1);
                setDiceTransform('rotateX(0deg) rotateY(0deg)');
                setPlayers(prev => prev.map(p => ({ ...p, position: 1, name: p.name.startsWith('Diver') ? '' : p.name })));
                setIsMoving(false);
                setIsTurnSwitching(false);
            };

            // --- RENDERERS ---
            const TreasureSVG = () => (
                <div className="w-full h-full flex items-center justify-center animate-bounce">
                     <span className="text-4xl filter drop-shadow-lg">👑</span>
                </div>
            );

            const renderConnections = () => {
                return (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {Object.entries(CURRENTS).map(([start, end]) => {
                            const startCoords = getBoardCoordinates(Number(start));
                            const endCoords = getBoardCoordinates(Number(end));
                            const cp1x = startCoords.x + (Math.random() * 10 - 5);
                            const cp1y = startCoords.y - (startCoords.y - endCoords.y) / 2;
                            return (
                                <g key={`current-${start}`}>
                                    <path d={`M ${startCoords.x},${startCoords.y} Q ${cp1x},${cp1y} ${endCoords.x},${endCoords.y}`} stroke="#38bdf8" strokeWidth="2" fill="none" strokeDasharray="3,2" className="opacity-80" />
                                    <text x={startCoords.x} y={startCoords.y} fontSize="3" dy="1" textAnchor="middle">🌊</text>
                                </g>
                            );
                        })}
                        {Object.entries(WHIRLPOOLS).map(([start, end]) => {
                            const startCoords = getBoardCoordinates(Number(start));
                            const endCoords = getBoardCoordinates(Number(end));
                            return (
                                <g key={`whirlpool-${start}`}>
                                    <line x1={startCoords.x} y1={startCoords.y} x2={endCoords.x} y2={endCoords.y} stroke="#a855f7" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                                    <text x={startCoords.x} y={startCoords.y} fontSize="3" dy="1" textAnchor="middle">🌪️</text>
                                </g>
                            );
                        })}
                    </svg>
                );
            };

            const renderBoard = () => {
                const cells = [];
                for (let row = 9; row >= 0; row--) {
                    for (let col = 0; col < 10; col++) {
                        const y = row;
                        const x = col;
                        let number = (y % 2 === 0) ? y * 10 + x + 1 : y * 10 + (10 - x);
                        let visualNumber;
                        const visualRow = 9 - row;
                        if (visualRow % 2 === 0) visualNumber = 100 - (visualRow * 10) - col;
                        else visualNumber = (100 - ((visualRow + 1) * 10)) + col + 1;

                        const isWhirlpool = WHIRLPOOLS[visualNumber];
                        const isCurrent = CURRENTS[visualNumber];
                        const isDark = (row + col) % 2 === 0;
                        
                        let bgClass = isDark ? 'bg-cyan-600/90' : 'bg-cyan-500/90';
                        if (visualNumber === 100) bgClass = 'bg-yellow-400';

                        cells.push(
                            <div key={visualNumber} className={`relative w-full h-full flex items-center justify-center border-[0.5px] border-cyan-800/30 ${bgClass} shadow-inner rounded-sm`}>
                                <span className={`text-[8px] sm:text-[10px] font-bold absolute top-0.5 left-1 ${isWhirlpool ? 'text-purple-200' : isCurrent ? 'text-white' : 'text-cyan-900/50'}`}>
                                {visualNumber}
                                </span>
                                {visualNumber === 100 && <TreasureSVG />}
                            </div>
                        );
                    }
                }
                return cells;
            };

            const renderPlayers = () => {
                return players.map((p, idx) => {
                    const coords = getBoardCoordinates(p.position);
                    const offsetX = (idx % 2 === 0 ? -1 : 1) * (Math.floor(idx/2) * 4);
                    const offsetY = (idx > 1 ? -1 : 0) * 3;
                    return (
                        <div key={idx} className={`absolute flex flex-col items-center justify-end transition-all duration-500`} style={{ left: `calc(${coords.x}% + ${offsetX}px)`, top: `calc(${coords.y}% + ${offsetY}px)`, transform: `translate(-50%, -80%) translateZ(20px) ${isMoving && idx === currentPlayerIdx ? 'scale(1.3) translateY(-5px)' : 'scale(1)'}`, zIndex: 50 + idx }}>
                            <div className={`text-3xl sm:text-4xl filter drop-shadow-md ${isMoving && idx === currentPlayerIdx ? 'animate-bounce' : ''}`}>{p.avatar}</div>
                            <div className={`w-3 h-1 rounded-full bg-black/30 blur-sm`}></div>
                        </div>
                    );
                });
            };

            const DiceRender = () => {
                const faces = [
                    {val:1, tf: 'translateZ(48px)'},
                    {val:6, tf: 'rotateY(180deg) translateZ(48px)'},
                    {val:4, tf: 'rotateY(90deg) translateZ(48px)'},
                    {val:3, tf: 'rotateY(-90deg) translateZ(48px)'},
                    {val:2, tf: 'rotateX(90deg) translateZ(48px)'},
                    {val:5, tf: 'rotateX(-90deg) translateZ(48px)'}
                ];

                const renderDots = (num) => {
                    const dots = [];
                    if (num === 1 || num === 3 || num === 5) dots.push(<div key="c" className="absolute w-4 h-4 rounded-full dice-dot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>);
                    if (num > 1) {
                        dots.push(<div key="tl" className="absolute w-4 h-4 rounded-full dice-dot top-3 left-3"></div>);
                        dots.push(<div key="br" className="absolute w-4 h-4 rounded-full dice-dot bottom-3 right-3"></div>);
                    }
                    if (num > 3) {
                        dots.push(<div key="tr" className="absolute w-4 h-4 rounded-full dice-dot top-3 right-3"></div>);
                        dots.push(<div key="bl" className="absolute w-4 h-4 rounded-full dice-dot bottom-3 left-3"></div>);
                    }
                    if (num === 6) {
                        dots.push(<div key="ml" className="absolute w-4 h-4 rounded-full dice-dot top-1/2 left-3 -translate-y-1/2"></div>);
                        dots.push(<div key="mr" className="absolute w-4 h-4 rounded-full dice-dot top-1/2 right-3 -translate-y-1/2"></div>);
                    }
                    return dots;
                };

                return (
                    <div id="dice-cube" 
                        className={`relative w-full h-full transform-style-3d ${isRolling ? 'animate-dice-spin' : 'transition-transform duration-700'}`} 
                        style={{ transform: isRolling ? 'none' : diceTransform }}>
                        {faces.map(face => (
                            <div key={face.val} className="absolute w-24 h-24 dice-face rounded-xl flex flex-wrap" style={{ transform: face.tf }}>
                                {renderDots(face.val)}
                            </div>
                        ))}
                    </div>
                );
            };

            // --- VIEW ---
            return (
                <div className="min-h-screen font-sans flex flex-col items-center py-4 px-2 overflow-hidden relative perspective-container text-white">
                    {/* Bubbles Background */}
                    <div className="fixed inset-0 pointer-events-none">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="bubble" 
                                style={{ 
                                    width: Math.random() * 20 + 10 + 'px', 
                                    height: Math.random() * 20 + 10 + 'px', 
                                    left: Math.random() * 100 + '%', 
                                    animation: `float-bubble ${Math.random() * 5 + 5}s infinite linear`,
                                    animationDelay: Math.random() * 5 + 's'
                                }} 
                            />
                        ))}
                    </div>

                    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 opacity-60">
                        <span className="text-xs text-cyan-200">Mode: Simple +/-</span>
                    </div>

                    {gameState === 'setup' && (
                        <div className="relative z-30 w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/30 shadow-2xl mt-10 animate-sway">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-yellow-300 drop-shadow-md fun-font mb-2 tracking-wide animate-wave-text">Ocean Adventure</h1>
                                <p className="text-cyan-100 text-lg">Deep Sea Mathematics</p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-cyan-200 uppercase tracking-widest mb-2 block">Number of Divers</label>
                                    <div className="flex gap-2">
                                        {[2, 3, 4].map(n => (
                                            <button key={n} onClick={() => updateNumPlayers(n)} className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${numPlayers === n ? 'bg-yellow-400 border-yellow-400 text-cyan-900 scale-105' : 'bg-transparent border-white/30 text-white hover:bg-white/10'}`}>{n}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-cyan-200 uppercase tracking-widest block">Divers</label>
                                    {players.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => cycleAvatar(i, 'prev')} className="text-cyan-300 hover:text-white"><div className="rotate-180">➤</div></button>
                                                <div className="text-3xl w-12 text-center">{p.avatar}</div>
                                                <button onClick={() => cycleAvatar(i, 'next')} className="text-cyan-300 hover:text-white">➤</button>
                                            </div>
                                            <input type="text" value={p.name} onChange={(e) => handleNameChange(i, e.target.value)} placeholder={`Player ${i+1}`} className="flex-1 bg-transparent border-b border-cyan-300/50 text-white px-2 py-1 focus:border-yellow-300 outline-none placeholder:text-cyan-200/50 font-bold" />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={startGame} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white py-4 rounded-xl font-bold text-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2">
                                    <Anchor /> Dive In!
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center mt-2">
                            {/* Board Container */}
                            <div className="w-full max-w-[600px] lg:flex-1 perspective-[1000px]">
                                <div className="relative w-full aspect-square bg-[#082f49] rounded-xl shadow-2xl border-8 border-cyan-800 transform-style-3d rotate-x-10 transition-transform duration-500">
                                    <div className="absolute inset-0 w-full h-full bg-[#0c4a6e] overflow-hidden rounded-lg">
                                        <div className="grid grid-cols-10 grid-rows-10 w-full h-full absolute inset-0 z-0">{renderBoard()}</div>
                                        {renderConnections()}
                                        {renderPlayers()}
                                    </div>
                                </div>
                            </div>

                            {/* Controls & Status */}
                            <div className="w-full max-w-md lg:w-96 flex flex-col gap-4">
                                <div className="relative bg-white/10 backdrop-blur-md text-white p-6 rounded-2xl border border-white/20 shadow-xl min-h-[400px]">
                                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-300">Current Turn</span>
                                            <h2 className="text-3xl font-bold fun-font text-yellow-300">{players[currentPlayerIdx].name}</h2>
                                        </div>
                                        <div className="text-5xl animate-bounce">{players[currentPlayerIdx].avatar}</div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center justify-center mb-6">
                                        <div className="perspective-[600px] w-24 h-24 mb-6">
                                            <DiceRender />
                                        </div>
                                        <div className="text-center min-h-[3rem] flex items-center justify-center px-4 py-2 bg-black/20 rounded-lg w-full mb-4">
                                            <p className="text-sm font-bold text-cyan-200">{message}</p>
                                        </div>
                                        <button onClick={rollDice} disabled={isRolling || isMoving || showQuestion || isTurnSwitching} className={`w-full py-4 rounded-xl font-bold text-xl uppercase tracking-wider transition-all shadow-lg ${isRolling || isMoving || isTurnSwitching ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transform active:scale-95'}`}>
                                            {isRolling ? 'Rolling...' : 'Roll Dice (Space)'}
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs uppercase font-bold text-cyan-300/70 border-b border-white/10 pb-1">
                                            <span>Depth Chart</span>
                                            <button onClick={resetGame} className="hover:text-red-400 transition-colors"><RotateCcw size={14}/></button>
                                        </div>
                                        {players.map((p, i) => (
                                            <div key={i} className={`flex justify-between items-center p-3 rounded-lg transition-colors ${currentPlayerIdx === i ? 'bg-yellow-400/20 border border-yellow-400/50' : 'hover:bg-white/5'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{p.avatar}</span>
                                                    <span className="font-bold">{p.name}</span>
                                                </div>
                                                <span className="font-bold font-mono text-cyan-300">{p.position}m</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {gameState === 'winner' && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                            <div className="bg-white text-center p-10 rounded-3xl max-w-lg shadow-2xl transform scale-100 animate-sway border-4 border-yellow-400">
                                <div className="text-8xl mb-4">{players[currentPlayerIdx].avatar}</div>
                                <h2 className="text-5xl fun-font text-blue-600 mb-2">Treasure Found!</h2>
                                <p className="text-gray-500 mb-8 text-xl">The ocean is conquered.</p>
                                <div className="text-3xl font-bold text-gray-800 mb-8">{players[currentPlayerIdx].name} Wins!</div>
                                <button onClick={resetGame} className="bg-yellow-400 text-blue-900 px-10 py-4 rounded-full font-bold text-xl hover:bg-yellow-300 shadow-lg transition-transform hover:scale-105">Play Again</button>
                            </div>
                        </div>
                    )}

                    {showQuestion && currentQuestion && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 perspective-[1000px]">
                            <div className="relative w-full max-w-xl bg-white rounded-3xl p-8 shadow-2xl animate-wave-text border-b-8 border-cyan-600">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2 text-cyan-700">
                                        <Fish className="w-8 h-8" />
                                        <span className="font-bold text-xl">Math Challenge</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold font-mono">
                                        <Clock className={`w-5 h-5 ${timer <= 5 ? 'text-red-500 animate-pulse' : ''}`} />
                                        <span className={timer <= 5 ? 'text-red-500' : ''}>{timer}s</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="bg-cyan-50 border-2 border-cyan-100 p-10 rounded-2xl mb-8">
                                        <div className="text-6xl font-bold text-cyan-800 fun-font tracking-wider">{currentQuestion.questionText}</div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {currentQuestion.options.map((opt, idx) => (
                                            <button key={idx} onClick={() => handleAnswer(opt.isCorrect)} className="p-6 bg-white border-4 border-gray-100 hover:border-yellow-400 hover:bg-yellow-50 rounded-xl transition-all active:scale-95 shadow-sm text-3xl font-bold text-gray-700">
                                                {opt.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<OceanMathExplorer />);
    