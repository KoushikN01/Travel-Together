import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Dock.css';

const DockItem = ({ icon, label, onClick, isHovered }) => {
  return (
    <motion.div
      className="dock-item"
      whileHover={{ scale: 1.2 }}
      onClick={onClick}
    >
      <div className="dock-icon">{icon}</div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="dock-label"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Dock = ({ items, className = "" }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="dock-outer">
      <motion.div
        className={`dock-panel ${className}`}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            isHovered={hoveredIndex === index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Dock; 