@echo off
echo Setting up database...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE donexus_challenge;"
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d donexus_challenge -f db/schema.sql
echo Database setup complete!
