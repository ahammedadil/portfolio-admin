const API_URL = 'http://localhost:5000/api'; // Change this to your backend URL when deployed

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const sectionTitle = document.getElementById('current-section-title');

// Stats Elements
const statProjects = document.getElementById('stat-projects');

// Modals
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const modalTitle = document.getElementById('modal-title');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    fetchProjects();
});

// --- Navigation Logic ---
function initNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.classList.contains('logout')) return;
            e.preventDefault();
            
            // Remove active from all
            navItems.forEach(n => n.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));

            // Add active to clicked
            item.classList.add('active');
            
            // Show target section
            const targetId = item.getAttribute('data-target');
            if (targetId) {
                document.getElementById(targetId).classList.add('active');
                // Update title
                sectionTitle.textContent = item.textContent.trim();
            }
        });
    });
}

// --- Projects Module ---
let projectsData = [];

async function fetchProjects() {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '<div class="loading-state">Loading projects...</div>';

    try {
        const response = await fetch(`${API_URL}/projects`);
        if (!response.ok) {
            // Throw error if not 200, but for local dev if backend is offline, we'll show dummy data or error
            throw new Error('Network response was not ok');
        }
        projectsData = await response.json();
        
    } catch (error) {
        console.warn('Backend not reachable, showing empty state or dummy data for UI preview.');
        // dummy data for UI preview if backend is off
        projectsData = [
            {
                _id: '1',
                title: 'E-commerce Platform',
                category: 'Full Stack',
                technologies: ['React', 'Node.js', 'MongoDB'],
                github: '#',
                liveDemo: '#',
                description: 'A complete e-commerce solution with payment gateway integration.',
                featured: true
            }
        ];
    }
    
    renderProjects();
}

function renderProjects() {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';
    
    // Update Stats
    statProjects.textContent = projectsData.length;

    if (projectsData.length === 0) {
        grid.innerHTML = '<div class="loading-state">No projects found. Add one!</div>';
        return;
    }

    projectsData.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card glass-panel';
        
        const techTags = project.technologies.map(t => `<span class="tech-tag">${t.trim()}</span>`).join('');
        
        card.innerHTML = `
            <div class="project-header">
                <div>
                    <h3 class="project-title">${project.title}</h3>
                    <span class="project-category">${project.category}</span>
                </div>
                <div class="project-actions">
                    <button class="icon-btn edit" onclick="editProject('${project._id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" onclick="deleteProject('${project._id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">
                ${project.description.substring(0, 80)}${project.description.length > 80 ? '...' : ''}
            </p>
            <div class="project-tech">
                ${techTags}
            </div>
            <div class="project-links">
                ${project.github ? `<a href="${project.github}" target="_blank"><i class="fa-brands fa-github"></i> GitHub</a>` : ''}
                ${project.liveDemo ? `<a href="${project.liveDemo}" target="_blank"><i class="fa-solid fa-external-link-alt"></i> Live Demo</a>` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function openProjectModal() {
    projectForm.reset();
    document.getElementById('project-id').value = '';
    modalTitle.textContent = 'Add Project';
    projectModal.classList.add('active');
}

function closeProjectModal() {
    projectModal.classList.remove('active');
}

function editProject(id) {
    const project = projectsData.find(p => p._id === id);
    if (!project) return;

    document.getElementById('project-id').value = project._id;
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-category').value = project.category;
    document.getElementById('project-tech').value = project.technologies.join(', ');
    document.getElementById('project-github').value = project.github || '';
    document.getElementById('project-demo').value = project.liveDemo || '';
    document.getElementById('project-desc').value = project.description;
    document.getElementById('project-featured').checked = project.featured || false;
    
    modalTitle.textContent = 'Edit Project';
    projectModal.classList.add('active');
}

projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('project-id').value;
    const projectData = {
        title: document.getElementById('project-title').value,
        category: document.getElementById('project-category').value,
        technologies: document.getElementById('project-tech').value.split(',').map(t => t.trim()),
        github: document.getElementById('project-github').value,
        liveDemo: document.getElementById('project-demo').value,
        description: document.getElementById('project-desc').value,
        featured: document.getElementById('project-featured').checked
    };

    try {
        let response;
        if (id) {
            // Edit
            response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
        } else {
            // Add
            response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
        }

        if (response.ok) {
            closeProjectModal();
            fetchProjects();
        } else {
            alert('Failed to save project. Is the backend running?');
            // Mock UI update if backend is off
            if(!id) {
                projectData._id = Math.random().toString();
                projectsData.push(projectData);
            } else {
                const idx = projectsData.findIndex(p => p._id === id);
                projectData._id = id;
                projectsData[idx] = projectData;
            }
            renderProjects();
            closeProjectModal();
        }
    } catch (error) {
        console.error('Error saving project:', error);
        alert('Failed to save project. Is the backend running?');
    }
});

async function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchProjects();
            } else {
                alert('Failed to delete project.');
                // Mock UI update
                projectsData = projectsData.filter(p => p._id !== id);
                renderProjects();
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project.');
            projectsData = projectsData.filter(p => p._id !== id);
            renderProjects();
        }
    }
}
