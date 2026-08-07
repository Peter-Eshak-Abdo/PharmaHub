### 1. `2 commits ahead`
```bash
git checkout main
git pull origin main
git merge origin/BRANCH_NAME
git push origin main
```

### 2. `2 commits behind`
```bash
git checkout BRANCH_NAME
git pull origin BRANCH_NAME
git merge origin/main
git push origin BRANCH_NAME
```

### 3. `2 commits ahead` + `2 commits behind`
```bash
git checkout BRANCH_NAME
git pull origin BRANCH_NAME
git merge origin/main
git push origin BRANCH_NAME

git checkout main
git pull origin main
git merge origin/BRANCH_NAME
git push origin main
```

### 4. `0 ahead` + `0 behind`
```bash
git checkout main
git pull origin main
```

### 5. `ahead` + `behind` وفيه Conflict
```bash
git checkout BRANCH_NAME
git pull origin BRANCH_NAME
git merge origin/main
```

```bash
git add .
git commit
git push origin BRANCH_NAME
```

```bash
git checkout main
git pull origin main
git merge origin/BRANCH_NAME
git push origin main
```
