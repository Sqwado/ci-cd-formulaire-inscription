FROM python:3.9

WORKDIR /server

COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt \
    && apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8000
