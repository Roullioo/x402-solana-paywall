.PHONY: install dev build test e2e clean lint format

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

e2e:
	pnpm e2e

lint:
	pnpm lint

format:
	pnpm format

clean:
	pnpm clean

