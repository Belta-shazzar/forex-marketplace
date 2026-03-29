# Contributing & Development Guide

## For Contributors

### Code Style

- **Language:** TypeScript (strict mode)
- **Formatter:** Prettier
- **Linter:** ESLint
- **Naming:** camelCase for variables/functions, PascalCase for classes

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that don't affect code meaning
- refactor: Code change that neither fixes a bug nor adds a feature
- perf: Code change that improves performance
- test: Adding or updating tests

**Example:**
```
feat(user-service): add password reset endpoint

Added email-based password reset functionality with
secure token generation and expiration.

Closes #123
```

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Make your changes
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Format code: `npm run format`
7. Commit with message: `git commit -m 'feat(...): description'`
8. Push: `git push origin feature/AmazingFeature`
9. Create Pull Request

### Testing Guidelines

- Write tests along with new features
- Minimum 70% code coverage
- Test both happy path and error cases
- Use descriptive test names

Example:
```typescript
describe('AuthService.register', () => {
  it('should register a new user with valid credentials', async () => {
    // Test implementation
  });

  it('should throw error if email already exists', async () => {
    // Test implementation
  });
});
```

## Local Development Workflow

### Setting Up for Development

```bash
# Clone
git clone <repo>
cd forex-marketplace

# Install
npm install

# Setup env
cp .env.example .env.development

# Start services
docker-compose up -d

# Or manually run each service
npm run start:dev user-service
npm run start:dev wallet-service
npm run start:dev rate-service
npm run start:dev transaction-service
```

### Making Changes

```bash
# Create a new branch
git checkout -b feature/my-feature

# Make your changes
# Add new endpoints, services, entities, etc.

# Test your changes
npm test -- --watch

# Run linter
npm run lint -- --fix

# Format code
npm run format

# Commit and push
git add .
git commit -m 'feat(...): description'
git push origin feature/my-feature
```

### Adding a New Feature

#### Example: Add endpoint to get all users

1. **Update Entity** (if needed)
2. **Create DTO:**
```typescript
// user.dto.ts
export class UsersListResponseDto {
  users: UserResponseDto[];
  total: number;
}
```

3. **Update Service:**
```typescript
// user.service.ts
async getAll(skip = 0, take = 10): Promise<UsersListResponseDto> {
  const [users, total] = await this.userRepository.findAndCount({
    skip,
    take,
  });
  return {
    users: users.map(u => this.toResponseDto(u)),
    total,
  };
}
```

4. **Update Controller:**
```typescript
// user.controller.ts
@Get()
async getAll(
  @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
): Promise<UsersListResponseDto> {
  return this.userService.getAll(skip, take);
}
```

5. **Write Tests:**
```typescript
// user.service.spec.ts
it('should return list of users with pagination', async () => {
  const result = await service.getAll(0, 10);
  expect(result.users).toHaveLength(expect.any(Number));
  expect(result.total).toBeGreaterThanOrEqual(0);
});
```

6. **Commit and Push**

## Debugging

### Using Chrome DevTools

```bash
# Start service with debugging flag
node --inspect=0.0.0.0:9229 dist/apps/user-service/main.js

# Open Chrome and go to:
# chrome://inspect

# Click "inspect" on the process
```

### Using VS Code Debugger

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug User Service",
      "program": "${workspaceFolder}/dist/apps/user-service/main.js",
      "preLaunchTask": "build:user-service",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Performance Tips

1. **Use Indexes** - Add MongoDB indexes for frequently queried fields
2. **Lazy Load** - Load relations only when needed
3. **Cache** - Use Redis for frequently accessed data
4. **Batch** - Combine multiple operations into single request
5. **Pagination** - Always paginate list endpoints

## Security Checklist

- [ ] No secrets in code
- [ ] Validate all inputs
- [ ] Use prepared statements/ORM
- [ ] Hash passwords
- [ ] Use HTTPS
- [ ] Implement rate limiting
- [ ] Add authentication guards
- [ ] Sanitize error messages
- [ ] Log security events
- [ ] Regular dependency updates

## Release Process

1. Increase version in `package.json`
2. Update `CHANGELOG.md`
3. Create release commit: `git commit -m 'chore: v1.0.0'`
4. Create git tag: `git tag v1.0.0`
5. Push changes and tag
6. Create release on GitHub

## Troubleshooting Development Issues

### Service won't start

```bash
# Check logs
docker-compose logs user-service

# Verify dependencies
npm list

# Rebuild
npm install
npx nx reset
npx nx build user-service
```

### Database connection errors

```bash
# Check MongoDB is running
docker-compose ps

# Connect to MongoDB shell
docker-compose exec mongodb mongosh

# Verify connection string in .env
```

### Tests failing

```bash
# Clear test cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Run specific test file
npm test user.service.ts
```

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [REST API Design Guidelines](https://restfulapi.net)

---

Thank you for contributing! 🎉
