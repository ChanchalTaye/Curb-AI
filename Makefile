.PHONY: dev test build down logs clean

dev:
	docker compose -f infra/docker-compose.yml -f infra/docker-compose.dev.yml up --build

down:
	docker compose -f infra/docker-compose.yml down -v

build:
	docker compose -f infra/docker-compose.yml build

test:
	docker compose -f infra/docker-compose.test.yml up --build --abort-on-container-exit

logs:
	docker compose -f infra/docker-compose.yml logs -f

clean:
	docker compose -f infra/docker-compose.yml down -v --rmi local
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
