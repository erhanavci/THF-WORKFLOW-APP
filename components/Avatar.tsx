import React from 'react';
import { Member } from '../types';

interface AvatarProps {
  member: Member;
  size?: 'sm' | 'md' | 'lg';
  responsible?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ member, size = 'md', responsible = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className="relative group">
      <img
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${responsible ? 'ring-sky-500' : ''}`}
        src={member.avatarUrl}
        alt={member.name}
      />
      <div className="absolute z-10 bottom-full mb-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none left-1/2 -translate-x-1/2">
        {member.name}
        {member.role && <span className="text-slate-400 block">{member.role}</span>}
      </div>
    </div>
  );
};

export default Avatar;