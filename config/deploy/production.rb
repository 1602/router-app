set :node_env, "production"
set :branch, "production"
set :deploy_to, "/var/www/apps/#{application}/#{node_env}"
set :application_port, "1604"
