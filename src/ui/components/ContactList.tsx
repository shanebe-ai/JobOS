import React, { useState } from 'react';
import { type Person, type RelationshipType } from '../../domain/person';
import { StorageService } from '../../services/storage';

interface ContactListProps {
    contacts: Person[];
    defaultCompany?: string;
    onUpdate: () => void;
    onDraftEmail: (person: Person) => void;
    onDelete: (id: string) => void;
}

export const ContactList: React.FC<ContactListProps> = ({ contacts, defaultCompany, onUpdate, onDraftEmail, onDelete }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Partial<Person>>({
        name: '',
        role: '',
        company: defaultCompany || '',
        type: 'Recruiter',
        email: '',
        phone: '',
        notes: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Reset company when defaultCompany changes (if adding)
    React.useEffect(() => {
        if (isAdding && defaultCompany) {
            setFormData(prev => ({ ...prev, company: defaultCompany }));
        }
    }, [defaultCompany, isAdding]);

    const formatPhoneNumber = (value: string) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, '');
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 1) return phoneNumber;
        // Hardcode leading 1 for now as requested
        if (phoneNumberLength < 4) return `1 (${phoneNumber}`;
        if (phoneNumberLength < 7) return `1 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        return `1 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value.replace(/^1\s?\(?/, '')); // strip leading 1/paren to re-process key inputs
        setFormData({ ...formData, phone: formatted.slice(0, 16) }); // Cap length
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        let isValid = true;

        if (!formData.name?.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        }

        if (!formData.role?.trim()) {
            errors.role = 'Role is required';
            isValid = false;
        }

        if (!formData.email?.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'Invalid email format';
                isValid = false;
            }
        }

        if (formData.phone?.trim()) {
            // Updated regex for 1 (XXX) XXX-XXXX format
            const phoneRegex = /^1 \(\d{3}\) \d{3}-\d{4}$/;
            if (!phoneRegex.test(formData.phone)) {
                errors.phone = 'Invalid phone format'; // Input mask should handle most, but just in case
                isValid = false;
            }
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const newPerson: Person = {
            id: crypto.randomUUID(),
            name: formData.name!,
            role: formData.role!,
            company: formData.company || defaultCompany || '',
            type: formData.type as RelationshipType,
            email: formData.email,
            phone: formData.phone,
            notes: formData.notes,
            dateAdded: new Date().toISOString(),
            ...formData as any
        };

        StorageService.savePerson(newPerson);
        setFormData({
            name: '',
            role: '',
            company: defaultCompany || '',
            type: 'Recruiter',
            email: '',
            phone: '',
            notes: ''
        });
        setFormErrors({});
        setIsAdding(false);
        onUpdate();
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Contacts</h3>
                <button className="btn btn-outline" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : '+ Add Person'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}>

                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {/* Company (Auto-filled) */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Company</label>
                            <input
                                className="input"
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Company"
                            />
                        </div>

                        {/* Name & Role */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <input
                                    className="input"
                                    style={{ width: '100%', borderColor: formErrors.name ? 'red' : undefined }}
                                    placeholder="Name *"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                {formErrors.name && <span style={{ color: 'red', fontSize: '0.75rem' }}>{formErrors.name}</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    className="input"
                                    style={{ width: '100%', borderColor: formErrors.role ? 'red' : undefined }}
                                    placeholder="Job Title *"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                                {formErrors.role && <span style={{ color: 'red', fontSize: '0.75rem' }}>{formErrors.role}</span>}
                            </div>
                        </div>

                        {/* Relationship */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Relationship</label>
                            <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                <option value="Recruiter">Recruiter</option>
                                <option value="HiringManager">Hiring Manager</option>
                                <option value="Referral">Referral</option>
                                <option value="Peer">Peer</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Contact Info */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <input
                                    className="input"
                                    style={{ width: '100%', borderColor: formErrors.email ? 'red' : undefined }}
                                    placeholder="Email *"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                                {formErrors.email && <span style={{ color: 'red', fontSize: '0.75rem' }}>{formErrors.email}</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    className="input"
                                    style={{ width: '100%', borderColor: formErrors.phone ? 'red' : undefined }}
                                    placeholder="1 (555) 555-5555"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                />
                                {formErrors.phone && <span style={{ color: 'red', fontSize: '0.75rem' }}>{formErrors.phone}</span>}
                            </div>
                        </div>

                        {/* Notes */}
                        <textarea
                            className="input"
                            style={{ minHeight: '60px', fontFamily: 'inherit' }}
                            placeholder="Notes (Optional)..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>Save Contact</button>
                </form>
            )}

            <div>
                {contacts.length === 0 && <p className="text-secondary">No contacts added.</p>}
                {contacts.map((p, index) => (
                    <div key={p.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <strong>{p.name}</strong> <span className="badge" style={{ background: '#f1f5f9' }}>{p.type}</span>
                                <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>{p.role} @ {p.company}</p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {p.email && <span>📧 {p.email} </span>}
                                    {p.phone && <span>📞 {p.phone}</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                    onClick={() => onDraftEmail(p)}
                                >
                                    Draft Email
                                </button>
                                {index > 0 && (
                                    <button
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}
                                        onClick={() => onDelete(p.id)}
                                        title="Delete Contact"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                        {p.notes && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.25rem' }}>"{p.notes}"</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};
