import React from 'react';

interface ActionItemProps {
  icon: React.ReactNode;
  text: string;
}

const ActionItem: React.FC<ActionItemProps> = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-base text-text-dark">{text}</span>
    </div>
  );
};

export default ActionItem;

