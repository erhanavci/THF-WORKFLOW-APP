
import React, { useState } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { Member } from '../types';
import Modal from './ui/Modal';
import { useToast } from '../hooks/useToast';

interface ManageTeamModalProps {
  onClose: () => void;
}

const ManageTeamModal: React.FC<ManageTeamModalProps> = ({ onClose }) => {
  const { members, addMember, updateMember, deleteMember } = useKanbanStore();
  const { showToast } = useToast();

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      showToast('Member name is required.', 'error');
      return;
    }
    addMember({
      name: newMemberName,
      role: newMemberRole,
      avatarUrl: `https://i.pravatar.cc/150?u=${crypto.randomUUID()}`,
    });
    setNewMemberName('');
    setNewMemberRole('');
  };

  const handleUpdateMember = () => {
    if (editingMember) {
      updateMember(editingMember);
      setEditingMember(null);
    }
  };
  
  const handleInputChange = (field: 'name' | 'role', value: string) => {
    if (editingMember) {
        setEditingMember({ ...editingMember, [field]: value });
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Manage Team">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Team Members</h3>
          <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {members.map(member => (
              <li key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                {editingMember?.id === member.id ? (
                  <div className="flex-grow flex gap-2">
                     <input type="text" value={editingMember.name} onChange={(e) => handleInputChange('name', e.target.value)} className="block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" />
                     <input type="text" value={editingMember.role} onChange={(e) => handleInputChange('role', e.target.value)} className="block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" />
                  </div>
                ) : (
                  <div className="flex-grow">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                  </div>
                )}
                <div className="flex gap-2">
                    {editingMember?.id === member.id ? (
                        <button onClick={handleUpdateMember} className="text-green-500 hover:text-green-700">Save</button>
                    ) : (
                        <button onClick={() => setEditingMember(member)} className="text-blue-500 hover:text-blue-700">Edit</button>
                    )}
                    <button onClick={() => deleteMember(member.id)} className="text-red-500 hover:text-red-700">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-medium">Add New Member</h3>
          <form onSubmit={handleAddMember} className="mt-4 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            />
            <input
              type="text"
              placeholder="Role"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            />
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Add Member
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default ManageTeamModal;
