# GitHub Repository Setup Guide

This guide will help you upload ChemLab Virtual to your GitHub repository and set up automatic deployments.

## 📋 Prerequisites

- Git installed on your local machine
- GitHub account
- ChemLab Virtual project files

## 🔧 Initial Repository Setup

### 1. Create GitHub Repository

1. **Go to GitHub**
   - Visit [github.com](https://github.com)
   - Sign in to your account

2. **Create New Repository**
   - Click the "+" icon in the top right
   - Select "New repository"
   - Repository name: `chemlab-virtual` (or your preferred name)
   - Description: "Interactive Chemistry Learning Platform"
   - Set to Public or Private (your choice)
   - **Do not** initialize with README, .gitignore, or license (we have these files)
   - Click "Create repository"

### 2. Local Git Setup

```bash
# Navigate to your project directory
cd chemlab-virtual

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ChemLab Virtual - Interactive Chemistry Learning Platform"

# Add GitHub remote
git remote add origin https://github.com/yourusername/chemlab-virtual.git

# Push to GitHub
git push -u origin main
```

### 3. Verify Upload

1. **Check GitHub Repository**
   - Refresh your GitHub repository page
   - Verify all files are uploaded
   - Check that README.md displays properly

2. **Repository Structure Should Include**
   ```
   ├── client/                 # Frontend React application
   ├── server/                 # Backend Express server
   ├── shared/                 # Shared TypeScript types
   ├── data/                   # Experiment data
   ├── README.md              # Main documentation
   ├── SETUP.md               # Setup instructions
   ├── package.json           # Dependencies and scripts
   ├── .gitignore             # Git ignore rules
   ├── LICENSE                # MIT License
   └── start-*.bat/.command/.sh # Platform startup scripts
   ```

## 🚀 GitHub Features Setup

### 1. Repository Settings

1. **About Section**
   - Go to repository settings
   - Add description: "Interactive Chemistry Learning Platform"
   - Add website URL (if deployed)
   - Add topics: `chemistry`, `education`, `virtual-lab`, `react`, `typescript`, `interactive-learning`

2. **Repository Topics**
   ```
   chemistry
   education
   virtual-lab
   react
   typescript
   node
   express
   interactive-learning
   science-education
   lab-simulation
   ```

### 2. Branch Protection (Recommended)

```bash
# GitHub Settings > Branches > Add rule
# Branch name pattern: main
# Protect matching branches:
# ✓ Require a pull request before merging
# ✓ Require status checks to pass before merging
# ✓ Require branches to be up to date before merging
```

### 3. GitHub Actions (CI/CD)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run type checking
      run: npm run check
    
    - name: Build application
      run: npm run build
    
    - name: Test build
      run: |
        npm run start &
        sleep 5
        curl -f http://localhost:5000/api/experiments || exit 1

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      run: |
        echo "Add your deployment commands here"
        # Example: Deploy to Vercel, Railway, etc.
```

## 🔐 Secrets Management

### 1. Repository Secrets

For production deployments, add secrets in GitHub:

1. **Go to Repository Settings**
   - Navigate to "Secrets and variables" > "Actions"
   - Click "New repository secret"

2. **Common Secrets to Add**
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   SESSION_SECRET=your-super-secret-session-key
   VERCEL_TOKEN=your-vercel-deployment-token
   RAILWAY_TOKEN=your-railway-deployment-token
   ```

### 2. Environment Files

Create `.env.example` with template values:
```env
# Copy this file to .env and fill in your values
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/chemlab_virtual
SESSION_SECRET=your-secret-key-here
```

## 📖 Documentation Setup

### 1. Wiki Setup

1. **Enable Wiki**
   - Go to repository Settings
   - Scroll to "Features"
   - Check "Wikis"

2. **Create Wiki Pages**
   - Home: Project overview and quick start
   - Installation: Detailed setup instructions
   - API Documentation: Backend API reference
   - Contributing: Contribution guidelines
   - Troubleshooting: Common issues and solutions

### 2. Issue Templates

Create `.github/ISSUE_TEMPLATE/`:

**Bug Report** (`.github/ISSUE_TEMPLATE/bug_report.md`):
```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 10, macOS 12, Ubuntu 20.04]
- Node.js version: [e.g. 18.17.0]
- Browser: [e.g. Chrome 115, Firefox 116]

**Additional context**
Add any other context about the problem here.
```

**Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.md`):
```markdown
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### 3. Pull Request Template

Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🌟 Repository Enhancement

### 1. README Badges

Add badges to your README.md:
```markdown
![Build Status](https://github.com/yourusername/chemlab-virtual/workflows/CI/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-18%2B-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
```

### 2. Social Preview

1. **Create Social Preview Image**
   - Dimensions: 1280x640 pixels
   - Include project logo and title
   - Save as `social-preview.png` in repository root

2. **Set Social Preview**
   - Go to repository Settings
   - Scroll to "Social preview"
   - Upload your image

### 3. Repository Labels

Create useful labels for issues and PRs:
```
bug - Something isn't working
enhancement - New feature or request
documentation - Improvements or additions to documentation
good first issue - Good for newcomers
help wanted - Extra attention is needed
question - Further information is requested
wontfix - This will not be worked on
```

## 🔄 Workflow Setup

### 1. Development Workflow

```bash
# Create feature branch
git checkout -b feature/new-experiment

# Make changes
git add .
git commit -m "Add new titration experiment"

# Push branch
git push origin feature/new-experiment

# Create pull request on GitHub
# Merge after review
```

### 2. Release Management

Create release workflow:
```bash
# Create release branch
git checkout -b release/v1.0.0

# Update version in package.json
# Create release notes
git add .
git commit -m "Release v1.0.0"

# Push and create GitHub release
git push origin release/v1.0.0
```

### 3. Automated Deployments

Example deployment workflow:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📊 Analytics and Insights

### 1. Enable GitHub Insights

- Go to repository "Insights" tab
- Monitor traffic, clones, forks
- Track popular content
- Review contributor statistics

### 2. Dependabot Setup

Create `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

## ✅ Final Checklist

- [ ] Repository created and files uploaded
- [ ] README.md displays correctly
- [ ] All platform startup scripts work
- [ ] CI/CD pipeline configured
- [ ] Issue and PR templates created
- [ ] Branch protection rules set
- [ ] Repository topics and description added
- [ ] Social preview image uploaded
- [ ] Secrets configured for deployment
- [ ] Documentation wiki created
- [ ] Labels organized
- [ ] Dependabot configured

## 🎉 Next Steps

1. **Share Your Repository**
   - Add link to your portfolio
   - Share with chemistry educators
   - Submit to educational resource lists

2. **Community Building**
   - Respond to issues and PRs
   - Create discussion threads
   - Write blog posts about the project

3. **Continuous Improvement**
   - Monitor usage analytics
   - Gather user feedback
   - Plan feature roadmap

---

**Your ChemLab Virtual repository is now ready for the world!** 🌍