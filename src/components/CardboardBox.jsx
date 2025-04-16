'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const CardboardBox = ({ onAnimationComplete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleBoxClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Give some time for the animation to complete before triggering the callback
      setTimeout(() => {
        onAnimationComplete();
      }, 2000);
    }
  };

  // Box dimensions
  const width = 240;
  const height = 300;
  const depth = 160;

  // Box Variants
  const boxVariants = {
    closed: {
      rotateX: 0,
      rotateY: 0,
    },
    open: {
      rotateX: 180,
      rotateY: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15,
        duration: 1,
      },
    }
  };

  const lidVariants = {
    closed: {
      rotateX: 0,
      originY: 0,
    },
    open: {
      rotateX: -180,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 10,
        delay: 0.2,
      },
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 1.5,
        duration: 0.5,
      },
    }
  };

  return (
    <div className="w-full flex justify-center items-center perspective-1000 py-12">
      <motion.div
        className="relative cursor-pointer"
        style={{ width, height }}
        onClick={handleBoxClick}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={boxVariants}
      >
        {/* Box base */}
        <div className="absolute w-full h-full transform-style-3d">
          {/* Front face */}
          <div 
            className="absolute bg-amber-700 cardboard-texture"
            style={{ 
              width: `${width}px`, 
              height: `${height}px`, 
              transform: `translateZ(${depth/2}px)`,
              backgroundImage: "linear-gradient(45deg, #d6a15a 25%, #c49351 25%, #c49351 50%, #d6a15a 50%, #d6a15a 75%, #c49351 75%, #c49351 100%)",
              backgroundSize: "20px 20px",
            }}
          >
            <div className="absolute left-1/2 top-4 w-2/3 h-8 bg-amber-800" style={{ transform: 'translateX(-50%)' }}></div>
          </div>
          
          {/* Back face */}
          <div 
            className="absolute bg-amber-700 cardboard-texture"
            style={{ 
              width: `${width}px`, 
              height: `${height}px`, 
              transform: `translateZ(-${depth/2}px) rotateY(180deg)`,
              backgroundImage: "linear-gradient(45deg, #d6a15a 25%, #c49351 25%, #c49351 50%, #d6a15a 50%, #d6a15a 75%, #c49351 75%, #c49351 100%)",
              backgroundSize: "20px 20px",
            }}
          >
            <div className="absolute left-1/2 top-4 w-2/3 h-8 bg-amber-800" style={{ transform: 'translateX(-50%)' }}></div>
          </div>
          
          {/* Left face */}
          <div 
            className="absolute bg-amber-600 cardboard-texture"
            style={{ 
              width: `${depth}px`, 
              height: `${height}px`, 
              transform: `translateX(-${depth/2}px) rotateY(-90deg)`,
              backgroundImage: "linear-gradient(45deg, #d6a15a 25%, #c49351 25%, #c49351 50%, #d6a15a 50%, #d6a15a 75%, #c49351 75%, #c49351 100%)",
              backgroundSize: "20px 20px",
            }}
          ></div>
          
          {/* Right face */}
          <div 
            className="absolute bg-amber-600 cardboard-texture"
            style={{ 
              width: `${depth}px`, 
              height: `${height}px`, 
              transform: `translateX(${depth/2}px) rotateY(90deg)`,
              backgroundImage: "linear-gradient(45deg, #d6a15a 25%, #c49351 25%, #c49351 50%, #d6a15a 50%, #d6a15a 75%, #c49351 75%, #c49351 100%)",
              backgroundSize: "20px 20px",
            }}
          ></div>
          
          {/* Bottom face */}
          <div 
            className="absolute bg-amber-800 cardboard-texture"
            style={{ 
              width: `${width}px`, 
              height: `${depth}px`, 
              transform: `translateY(${height/2}px) rotateX(90deg)`,
              backgroundImage: "linear-gradient(45deg, #d6a15a 25%, #c49351 25%, #c49351 50%, #d6a15a 50%, #d6a15a 75%, #c49351 75%, #c49351 100%)",
              backgroundSize: "20px 20px",
            }}
          ></div>
          
          {/* Box lid */}
          <motion.div
            className="absolute origin-top transform-style-3d"
            style={{ 
              width: `${width}px`, 
              height: `${depth}px`, 
              transform: `translateY(-${height/2}px) rotateX(-90deg)`,
            }}
            variants={lidVariants}
          >
            <div 
              className="absolute w-full h-full bg-amber-800 cardboard-texture"
              style={{ 
                backgroundImage: "linear-gradient(45deg, #d6a15a 25%, #c49351 25%, #c49351 50%, #d6a15a 50%, #d6a15a 75%, #c49351 75%, #c49351 100%)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="absolute left-1/2 bottom-4 w-2/3 h-8 bg-amber-900" 
                style={{ transform: 'translateX(-50%)' }}></div>
            </div>
          </motion.div>
          
          {/* Box content */}
          <motion.div
            className="absolute"
            style={{ 
              width: `${width-20}px`, 
              height: `${height-20}px`, 
              left: '10px',
              top: '10px',
            }}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            variants={contentVariants}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Welcome to BioVision
                </h2>
                <p className="text-white text-sm opacity-80">
                  Real-time biometric analysis
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CardboardBox;
