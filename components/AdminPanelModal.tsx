import React, { useState } from 'react';
import Modal from './ui/Modal';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { AllTaskStatuses, Member, MemberRole, TaskStatus } from '../types';
import { useToast } from '../hooks/useToast';
import Avatar from './Avatar';

interface AdminPanelModalProps {
  onClose: () => void;
}

type AdminTab = 'dashboard' | 'team' | 'board' | 'data';

const TeamManagement: React.FC = () => {
    const { members, addMember, updateMember, deleteMember, currentUser } = useKanbanStore();
    const { showToast } = useToast();

    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<MemberRole>(MemberRole.MEMBER);

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim()) {
            showToast('Member name is required.', 'error');
            return;
        }
        if (!newMemberEmail.trim() || !/^\S+@\S+\.\S+$/.test(newMemberEmail)) {
            showToast('A valid email is required.', 'error');
            return;
        }
        addMember({
            name: newMemberName,
            email: newMemberEmail,
            role: newMemberRole,
            avatarUrl: `https://i.pravatar.cc/150?u=${crypto.randomUUID()}`,
        });
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberRole(MemberRole.MEMBER);
    };

    const handleUpdateMember = () => {
        if (editingMember && editingMember.name.trim() && /^\S+@\S+\.\S+$/.test(editingMember.email)) {
            updateMember(editingMember);
            setEditingMember(null);
        } else {
            showToast('Member name and a valid email are required.', 'error');
        }
    };

    const handleInputChange = (field: keyof Member, value: string) => {
        if (editingMember) {
            setEditingMember({ ...editingMember, [field]: value });
        }
    };
    
    const handleDeleteClick = (member: Member) => {
        if (member.id === currentUser?.id) {
            showToast("You cannot delete yourself.", "error");
            return;
        }
        if (window.confirm(`Are you sure you want to remove ${member.name}?`)) {
            deleteMember(member.id);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Team Members</h3>
                <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                    {members.map(member => (
                        <li key={member.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md gap-2 border border-gray-200 dark:border-gray-700">
                            {editingMember?.id === member.id ? (
                                <>
                                    <div className="flex-grow flex items-center gap-2">
                                        <Avatar member={member} size="md" />
                                        <div className="flex-grow space-y-1">
                                            <input type="text" value={editingMember.name} onChange={(e) => handleInputChange('name', e.target.value)} className="block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm" placeholder="Name" />
                                            <input type="email" value={editingMember.email} onChange={(e) => handleInputChange('email', e.target.value)} className="block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm" placeholder="Email" />
                                        </div>
                                    </div>
                                    <div className="w-32 shrink-0">
                                        <select
                                            value={editingMember.role}
                                            onChange={(e) => handleInputChange('role', e.target.value)}
                                            className="block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs"
                                            disabled={editingMember.id === currentUser?.id}
                                        >
                                            <option value={MemberRole.ADMIN}>Admin</option>
                                            <option value={MemberRole.MEMBER}>Member</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-grow flex items-center gap-3">
                                    <Avatar member={member} size="md" />
                                    <div>
                                        <p className="font-semibold">{member.name} {member.id === currentUser?.id && <span className="text-xs text-blue-500">(You)</span>}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 shrink-0">
                                {editingMember?.id === member.id ? (
                                    <>
                                        <button onClick={handleUpdateMember} className="text-green-500 hover:text-green-700 font-semibold">Save</button>
                                        <button onClick={() => setEditingMember(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setEditingMember(member)} className="text-blue-500 hover:text-blue-700">Edit</button>
                                        <button onClick={() => handleDeleteClick(member)} className="text-red-500 hover:text-red-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed" disabled={member.id === currentUser?.id}>Delete</button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Add New Member</h3>
                <form onSubmit={handleAddMember} className="mt-4 flex flex-col sm:flex-row gap-4">
                    <input type="text" placeholder="Name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" />
                    <input type="email" placeholder="Email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" />
                    <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as MemberRole)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    >
                        <option value={MemberRole.MEMBER}>Member</option>
                        <option value={MemberRole.ADMIN}>Admin</option>
                    </select>
                    <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Add Member</button>
                </form>
            </div>
        </div>
    );
};

const BoardSettings: React.FC = () => {
    const { columnNames, updateColumnNames } = useKanbanStore();
    const [localNames, setLocalNames] = useState(columnNames);

    const handleSave = () => {
        updateColumnNames(localNames);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Column Names</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customize the names of the columns on your board.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AllTaskStatuses.map(status => (
                    <div key={status}>
                        <label htmlFor={`col-${status}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{status}</label>
                        <input
                            id={`col-${status}`}
                            type="text"
                            value={localNames[status]}
                            onChange={(e) => setLocalNames(prev => ({ ...prev, [status]: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-end">
                <button onClick={handleSave} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Save Changes</button>
            </div>
        </div>
    );
}

const DataManagement: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { clearAllTasks, resetBoard } = useKanbanStore();

    const handleClearTasks = () => {
        if (window.confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
            clearAllTasks();
        }
    };

    const handleResetBoard = () => {
        if (window.confirm('Are you sure you want to RESET the entire board? This will delete all tasks and members and restore the initial sample data.')) {
            resetBoard().then(() => {
                onClose();
            });
        }
    };

    return (
        <div className="p-4 border border-red-300 dark:border-red-700 rounded-lg">
            <h3 className="text-lg font-medium text-red-700 dark:text-red-300">Danger Zone</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">These actions are irreversible. Please proceed with caution.</p>
            <div className="mt-4 flex flex-col md:flex-row gap-4">
                <button onClick={handleClearTasks} className="px-4 py-2 w-full text-white bg-red-600 rounded-md hover:bg-red-700">Clear All Tasks</button>
                <button onClick={handleResetBoard} className="px-4 py-2 w-full text-white bg-red-800 rounded-md hover:bg-red-900">Reset Board to Default</button>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { tasks, members, columnNames } = useKanbanStore();
    const tasksByStatus = AllTaskStatuses.reduce((acc, status) => {
        acc[status] = tasks.filter(t => t.status === status).length;
        return acc;
    }, {} as Record<TaskStatus, number>);

    return (
         <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Board Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="text-3xl font-bold">{tasks.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="text-3xl font-bold">{members.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Team Members</p>
                </div>
            </div>
             <div className="mt-6">
                 <h4 className="font-medium mb-2">Tasks per Column</h4>
                 <div className="space-y-2">
                     {AllTaskStatuses.map(status => (
                         <div key={status}>
                             <div className="flex justify-between mb-1">
                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{columnNames[status]}</span>
                                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{tasksByStatus[status]}</span>
                             </div>
                             <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                                 <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: tasks.length > 0 ? `${(tasksByStatus[status] / tasks.length) * 100}%` : '0%' }}></div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    )
}

const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    const tabs: {id: AdminTab, label: string}[] = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'team', label: 'Team Management' },
        { id: 'board', label: 'Board Settings' },
        { id: 'data', label: 'Data Management' },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'team': return <TeamManagement />;
            case 'board': return <BoardSettings />;
            case 'data': return <DataManagement onClose={onClose} />;
            default: return null;
        }
    }

    return (
        <Modal isOpen onClose={onClose} title="Admin Panel" className="max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="-ml-6 -mt-6 md:border-r border-b md:border-b-0 border-gray-200 dark:border-gray-700 p-6 md:w-1/4">
                    <nav className="flex md:flex-col gap-2">
                        {tabs.map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-md text-left w-full ${activeTab === tab.id ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                             >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
        </Modal>
    );
};

export default AdminPanelModal;