// =========================
// LOGOUT
// =========================

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", (e) => {

        e.preventDefault();

        const confirmLogout = confirm("Are you sure you want to logout?");

        if (!confirmLogout) return;

        localStorage.removeItem("token");

        window.location.href = "login.html";

    });

}


// =========================
// AUTH CHECK
// =========================

const token = localStorage.getItem("token");

if (!token) {

    window.location.href = "login.html";

}

const API_URL = 'https://portfolio-backend-qcjm.onrender.com'; // Change this to your backend URL when deployed

// Auth Check (Double check in JS)

if (!token) {
    window.location.href = "login.html";
}

// Intercept all fetch requests to add Authorization header
const originalFetch = window.fetch;
window.fetch = async function() {
    let [resource, config] = arguments;
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    
    // Add token
    const currentToken = localStorage.getItem("token");
    if (currentToken) {
        config.headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    const response = await originalFetch(resource, config);
    // If token expired or invalid
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
    return response;
};
// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const sectionTitle = document.getElementById('current-section-title');

// Stats Elements
// Stats Elements
const statProjects = document.getElementById("stat-projects");
const statSkills = document.getElementById("stat-skills");
const statMessages = document.getElementById("stat-messages");
const statVisitors = document.getElementById("stat-visitors");

// Modals
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const modalTitle = document.getElementById('modal-title');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();

    fetchProjects();

    fetchSkills();

    fetchAbout();

    fetchMessages();

});
// --- Navigation Logic ---
function initNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.classList.contains('logout')) {
                localStorage.removeItem("token");
                window.location.href = "login.html";
                return;
            }
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
        const response = await fetch(`${API_URL}/api/projects`);
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
        
        const techTags = project.technology.map(t => `<span class="tech-tag">${t.trim()}</span>`).join('');
        
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
    document.getElementById('project-tech').value = project.technology.join(', ');
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
        technology: document.getElementById('project-tech').value.split(',').map(t => t.trim()),
        github: document.getElementById('project-github').value,
        liveDemo: document.getElementById('project-demo').value,
        description: document.getElementById('project-desc').value,
        featured: document.getElementById('project-featured').checked
    };

    try {
        let response;
        if (id) {
            // Edit
            response = await fetch(`${API_URL}/api/projects/${id}`, {
                method: 'PUT',
                headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                body: JSON.stringify(projectData)
            });
        } else {
            // Add
            response = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
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
            const response = await fetch(`${API_URL}api/projects/${id}`, {
                method: 'DELETE',
                headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
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
// =========================
// SKILLS MODULE
// =========================

let skillsData = [];

const skillModal = document.getElementById("skill-modal");
const skillForm = document.getElementById("skill-form");

async function fetchSkills() {

    const grid = document.getElementById("skills-grid");

    grid.innerHTML = `<div class="loading-state">Loading skills...</div>`;

    try {

        const response = await fetch(`${API_URL}/api/skills`);

        skillsData = await response.json();

        renderSkills();

    } catch (err) {

        console.error(err);

        grid.innerHTML = `<div class="loading-state">Failed to load skills.</div>`;

    }

}

function renderSkills() {

    const grid = document.getElementById("skills-grid");

    grid.innerHTML = "";

    document.getElementById("stat-skills").textContent = skillsData.length;

    skillsData.forEach(skill => {

        grid.innerHTML += `

        <div class="project-card glass-panel">

            <div class="project-header">

                <div>

                    <h3 class="project-title">${skill.name}</h3>

                    <span class="project-category">${skill.category}</span>

                </div>

                <div class="project-actions">

                    <button class="icon-btn edit"
                        onclick="editSkill('${skill._id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button class="icon-btn delete"
                        onclick="deleteSkill('${skill._id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>

            <p>
                Level : ${skill.level}%
            </p>

            <p>
                <i class="${skill.icon}"></i>
                ${skill.icon}
            </p>

        </div>

        `;

    });

}

function openSkillModal() {

    skillForm.reset();

    document.getElementById("skill-id").value = "";

    document.getElementById("skill-modal-title").textContent = "Add Skill";

    skillModal.classList.add("active");

}

function closeSkillModal() {

    skillModal.classList.remove("active");

}
skillForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const id = document.getElementById("skill-id").value;

    const skillData = {
        name: document.getElementById("skill-name").value,
        category: document.getElementById("skill-category").value,
        level: Number(document.getElementById("skill-level").value),
        icon: document.getElementById("skill-icon").value
    };

    try {

        let response;

        if (id) {

            response = await fetch(`${API_URL}/api/skills/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(skillData)
            });

        } else {

            response = await fetch(`${API_URL}/api/skills`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(skillData)
            });

        }

        if (response.ok) {

            closeSkillModal();

            fetchSkills();

        } else {

            alert("Failed to save skill.");

        }

    } catch (error) {

        console.error(error);

        alert("Server Error");

    }

});

function editSkill(id) {

    const skill = skillsData.find(s => s._id === id);

    if (!skill) return;

    document.getElementById("skill-id").value = skill._id;
    document.getElementById("skill-name").value = skill.name;
    document.getElementById("skill-category").value = skill.category;
    document.getElementById("skill-level").value = skill.level;
    document.getElementById("skill-icon").value = skill.icon;

    document.getElementById("skill-modal-title").textContent = "Edit Skill";

    skillModal.classList.add("active");

}

async function deleteSkill(id) {

    if (!confirm("Delete this skill?")) return;

    try {

        const response = await fetch(`${API_URL}api/skills/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {

            fetchSkills();

        } else {

            alert("Failed to delete skill.");

        }

    } catch (error) {

        console.error(error);

        alert("Server Error");

    }

}
function openSkillModal() {

    skillForm.reset();

    document.getElementById("skill-id").value = "";

    document.getElementById("skill-modal-title").textContent = "Add Skill";

    skillModal.classList.add("active");

}

// =========================
// ABOUT MODULE
// =========================

const aboutModal = document.getElementById("about-modal");
const aboutForm = document.getElementById("about-form");

let aboutData = {};

async function fetchAbout() {

    try {

        const response = await fetch(`${API_URL}/api/about`);

        aboutData = await response.json();

        renderAbout();

    } catch (error) {

        console.error(error);

        document.getElementById("about-card").innerHTML =
            "<p>Failed to load About section.</p>";

    }

}

function renderAbout() {

    document.getElementById("about-card").innerHTML = `
        <h3>Biography</h3>

        <p style="margin-top:15px; line-height:1.8;">
            ${aboutData.bio.join("<br><br>")}
        </p>
    `;

}

function openAboutModal() {

    document.getElementById("about-bio").value =
        aboutData.bio.join("\n\n");

    aboutModal.classList.add("active");

}

function closeAboutModal() {

    aboutModal.classList.remove("active");

}
aboutForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const bio = document
        .getElementById("about-bio")
        .value
        .split("\n\n");

    try {

        const response = await fetch(

            `${API_URL}/api/about/${aboutData._id}`,

            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },

                body: JSON.stringify({
                    bio
                })

            }

        );

        if (response.ok) {

            closeAboutModal();

            fetchAbout();

        } else {

            alert("Failed to update About.");

        }

    } catch (error) {

        console.error(error);

        alert("Server Error");

    }

});

// =========================
// CONTACT MODULE
// =========================

let messagesData = [];

async function fetchMessages() {

    const grid = document.getElementById("messages-grid");

    grid.innerHTML = `<div class="loading-state">Loading Messages...</div>`;

    try {

        const response = await fetch(`${API_URL}/api/contact`);

        messagesData = await response.json();

        renderMessages();

    } catch (error) {

        console.error(error);

        grid.innerHTML = `<div class="loading-state">Failed to load messages.</div>`;

    }

}

function renderMessages() {

    const grid = document.getElementById("messages-grid");

    grid.innerHTML = "";

    document.getElementById("stat-messages").textContent = messagesData.length;

    if (messagesData.length === 0) {

        grid.innerHTML = `<div class="loading-state">No Messages Found.</div>`;

        return;

    }

    messagesData.forEach(message => {

        grid.innerHTML += `

        <div class="project-card glass-panel">

            <h3>
                ${message.name}

                ${
                    message.isRead
                    ? '<span style="color:limegreen;">✔ Read</span>'
                    : '<span style="color:orange;">● Unread</span>'
                }

            </h3>

            <p><strong>Email:</strong> ${message.email}</p>

            <p style="margin-top:10px;">
                ${message.message}
            </p>

            <div class="project-actions" style="margin-top:20px;">

                ${
                    !message.isRead
                    ? `
                        <button
                            class="btn btn-primary"
                            onclick="markMessageRead('${message._id}')">

                            Mark Read

                        </button>
                    `
                    : ""
                }

                <button
                    class="btn btn-secondary"
                    onclick="deleteMessage('${message._id}')">

                    Delete

                </button>

            </div>

        </div>

        `;

    });

}
async function markMessageRead(id) {

    try {

        const response = await fetch(`${API_URL}/api/contact/${id}/read`, {

            method: "PUT",
            headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }

        });

        if (response.ok) {

            fetchMessages();

        } else {

            alert("Failed to mark message as read.");

        }

    } catch (error) {

        console.error(error);

    }

}

async function deleteMessage(id) {

    if (!confirm("Delete this message?")) return;

    try {

        const response = await fetch(`${API_URL}/api/contact/${id}`, {

            method: "DELETE",
            headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }

        });

        if (response.ok) {

            fetchMessages();

        } else {

            alert("Failed to delete message.");

        }

    } catch (error) {

        console.error(error);

    }

}