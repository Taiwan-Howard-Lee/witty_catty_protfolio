import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onUserChoice: (choice: 'guide' | 'standard') => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUserChoice }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate in after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="welcome-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
          >
            <div className="welcome-cat-container">
              <motion.div 
                className="welcome-cat"
                initial={{ y: 100, opacity: 0 }}
                animate={{ 
                  y: [100, -20, 0], 
                  opacity: 1,
                }}
                transition={{ 
                  duration: 0.8,
                  times: [0, 0.6, 1],
                  delay: 0.5
                }}
              >
                <div className="cat-ears">
                  <motion.div 
                    className="ear left"
                    animate={{ 
                      rotate: [-5, 5, -5],
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className="ear right"
                    animate={{ 
                      rotate: [5, -5, 5],
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <div className="cat-face">
                  <div className="cat-eyes">
                    <motion.div 
                      className="eye left"
                      animate={{ 
                        scaleY: [1, 0.1, 1],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        repeatDelay: 5,
                        duration: 0.2,
                      }}
                    />
                    <motion.div 
                      className="eye right"
                      animate={{ 
                        scaleY: [1, 0.1, 1],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        repeatDelay: 5,
                        duration: 0.2,
                      }}
                    />
                  </div>
                  <div className="cat-nose" />
                  <motion.div 
                    className="cat-mouth"
                    animate={{ 
                      scaleX: [1, 1.2, 1],
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="welcome-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <h1>Welcome to My Portfolio!</h1>
              <p>I'm Witty, your AI cat assistant. Would you like me to guide you through this portfolio?</p>
            </motion.div>
            
            <motion.div 
              className="welcome-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              <motion.button 
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUserChoice('guide')}
              >
                Yes, guide me!
              </motion.button>
              <motion.button 
                className="btn btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUserChoice('standard')}
              >
                No thanks
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
