docker run -it --rm \
    --name test-platform-form-filling \
    -v $(pwd):/app \
    -w /app \
    node:22-alpine \
    /bin/sh