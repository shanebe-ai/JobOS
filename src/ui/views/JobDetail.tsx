import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import type { Job } from '../../domain/job';
import { type Application, type ApplicationStatus } from '../../domain/application';
import { WorkflowService } from '../../services/workflow';
import { RecommendationService } from '../../services/recommendations';
import type { Action } from '../../domain/action';
import type { Engagement } from '../../domain/engagement';
import type { Person } from '../../domain/person';
import type { Artifact } from '../../domain/artifact';
import { EngagementLog } from '../components/EngagementLog';
import { ContactList } from '../components/ContactList';
import { ArtifactList } from '../components/ArtifactList';
import { DraftMessageModal } from '../components/DraftMessageModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import type { OutreachDraftContext } from '../../domain/ai';

interface JobDetailProps {
    jobId: string;
    onBack: () => void;
}

export const JobDetail: React.FC<JobDetailProps> = ({ jobId, onBack }) => {
    const [job, setJob] = useState<Job | null>(null);
    const [app, setApp] = useState<Application | null>(null);
    const [suggestions, setSuggestions] = useState<Action[]>([]);
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [contacts, setContacts] = useState<Person[]>([]);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [draftingContext, setDraftingContext] = useState<OutreachDraftContext | null>(null);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);

    const refreshData = () => {
        const jobs = StorageService.getJobs();
        const apps = StorageService.getApplications();
        const allEngagements = StorageService.getEngagements();
        const allPeople = StorageService.getPeople();
        const allArtifacts = StorageService.getArtifacts();

        const foundJob = jobs.find(j => j.id === jobId);
        const foundApp = apps.find(a => a.jobId === jobId);

        if (foundJob && foundApp) {
            setJob(foundJob);
            setApp(foundApp);
            setSuggestions(RecommendationService.getSuggestedActions(foundApp));
            setEngagements(allEngagements);
            // Filter contacts by company
            const relevantContacts = allPeople.filter(p => p.company === foundJob.company);
            setContacts(relevantContacts);
            setArtifacts(allArtifacts);
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
    }, [jobId]);

    const handleStatusChange = (newStatus: ApplicationStatus) => {
        if (app && WorkflowService.canTransition(app.status, newStatus)) {
            try {
                const updatedApp = WorkflowService.transition(app, newStatus);
                setApp(updatedApp);
                setSuggestions(RecommendationService.getSuggestedActions(updatedApp)); // Refresh suggestions
                refreshData(); // Refresh engagements and other data to reflect the change
            } catch (e) {
                alert(e);
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!job || !app) return <div>Job not found</div>;

    return (
        <div>
            <button onClick={onBack} className="btn btn-outline" style={{ marginBottom: '1rem' }}>← Back</button>

            <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 2 }}>
                    <div className="card">
                        <h1 style={{ marginTop: 0 }}>{job.title}</h1>
                        <h3 style={{ color: 'var(--text-secondary)' }}>{job.company}</h3>

                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
                            <label>Current Status</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{app.status}</span>
                                {/* Simple transition buttons for demo */}
                                {app.status === 'Saved' && <button className="btn btn-primary" onClick={() => handleStatusChange('Applied')}>Mark Applied</button>}
                                {app.status === 'Applied' && <button className="btn btn-primary" onClick={() => handleStatusChange('OutreachStarted')}>Start Outreach</button>}
                                {app.status === 'Applied' && <button className="btn btn-outline" onClick={() => handleStatusChange('Rejected')}>Rejected</button>}
                            </div>
                        </div>

                        <h3>Details</h3>
                        <p><strong>Location:</strong> {job.location}</p>
                        <p><strong>Source:</strong> {job.source}</p>
                        <div style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>{job.description}</div>
                    </div>

                    {app.notes && (
                        <div className="card" style={{ marginTop: '1rem', background: '#fffbeb', borderLeft: '4px solid #f59e0b' }}>
                            <strong>Notes</strong>
                            <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{app.notes}</p>
                        </div>
                    )}

                    <div style={{ marginTop: '1rem' }}>
                        <EngagementLog jobId={jobId} engagements={engagements} contacts={contacts} onUpdate={refreshData} />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <ContactList
                            contacts={contacts}
                            defaultCompany={job.company}
                            onUpdate={refreshData}
                            onDraftEmail={(person) => {
                                // Logic: If not the first contact, use Peer Outreach intent
                                const isPrimary = contacts.length > 0 && contacts[0].id === person.id;
                                setDraftingContext({
                                    recipientName: person.name,
                                    recipientRole: person.role,
                                    companyName: job.company,
                                    jobTitle: job.title,
                                    tone: 'Formal',
                                    intent: isPrimary ? 'FollowUp' : 'PeerOutreach',
                                    jobDescription: job.description
                                });
                            }}
                            onDelete={(id) => setContactToDelete(id)}
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <ArtifactList jobId={jobId} artifacts={artifacts} onUpdate={refreshData} jobDescription={job.description} />
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <h3>Suggested Actions</h3>
                    {suggestions.length === 0 && <p className="text-secondary">No urgent actions.</p>}
                    {suggestions.map(action => (
                        <div key={action.id} className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                            <strong>{action.title}</strong>
                            <p style={{ fontSize: '0.875rem', margin: '0.5rem 0' }}>{action.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="badge" style={{ background: '#e2e8f0' }}>{action.priority} Priority</span>
                                {action.type === 'FollowUp' || action.type === 'Outreach' ? (
                                    <button
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        onClick={() => {
                                            // Smart Recipient Logic
                                            const targetContact = contacts.find(c => c.company === job.company);
                                            const smartRecipient = targetContact ? targetContact.name.split(' ')[0] : 'Hiring Team';

                                            setDraftingContext({
                                                recipientName: smartRecipient,
                                                recipientRole: targetContact ? targetContact.role : 'Hiring Manager',
                                                companyName: job.company,
                                                jobTitle: job.title,
                                                tone: 'Formal',
                                                intent: action.type === 'FollowUp' ? 'FollowUp' : 'Connect',
                                                jobDescription: job.description
                                            });
                                        }}
                                    >
                                        AI Draft
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {draftingContext && (
                <DraftMessageModal
                    context={draftingContext}
                    onClose={() => setDraftingContext(null)}
                    onSave={(msg: string) => {
                        console.log('Saved draft:', msg);
                        // In real app, save as artifact or action note
                        setDraftingContext(null);
                    }}
                />
            )}

            <ConfirmationModal
                isOpen={!!contactToDelete}
                title="Remove Contact"
                message="Are you sure you want to remove this contact from the list? This action cannot be undone."
                onConfirm={() => {
                    if (contactToDelete) {
                        StorageService.deletePerson(contactToDelete);
                        refreshData();
                        setContactToDelete(null);
                    }
                }}
                onCancel={() => setContactToDelete(null)}
            />
        </div>
    );
};
