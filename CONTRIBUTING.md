# Contributing to x402 Solana Paywall

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/x402-solana-paywall.git
   cd x402-solana-paywall
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` files to `.env` in each package
   - Generate receiver keypair: `cd packages/server && pnpm receiver:keygen`
   - Generate agent keypair: `cd ../.. && pnpm agent:keygen`

4. **Run development servers**
   ```bash
   pnpm dev
   ```

## Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (run `pnpm format` before committing)
- **Linting**: ESLint (run `pnpm lint` to check)
- **Testing**: Write tests for new features

## Commit Messages

Use clear, descriptive commit messages:
- `feat: add new feature`
- `fix: fix bug`
- `docs: update documentation`
- `refactor: code restructuring`
- `test: add tests`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `pnpm test`
4. Update documentation if needed
5. Submit a pull request with a clear description

## Testing

- Run unit tests: `pnpm test`
- Run E2E tests: `pnpm e2e` (requires running server)
- Ensure all tests pass before submitting PR

## Questions?

Open an issue for questions or discussions about the project.

