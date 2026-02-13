#!/usr/bin/env ruby

require 'json'
require 'net/http'

class UserImporter
  def initialize(api_url)
    @api_url = api_url
  end

  def import_from_csv(file_path)
    users = parse_csv(file_path)
    users.each do |user|
      create_user(user)
    end
  end

  def parse_csv(file_path)
    users = []
    File.readlines(file_path).each_with_index do |line, index|
      next if index == 0 # skip header
      
      username, email = line.strip.split(',')
      users << { username: username, email: email }
    end
    users
  end

  def create_user(user)
    uri = URI("#{@api_url}/users")
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Post.new(uri.path, { 'Content-Type' => 'application/json' })
    request.body = user.to_json

    response = http.request(request)
    
    if response.code.to_i == 201
      puts "Created user: #{user[:username]}"
    else
      puts "Failed to create user: #{user[:username]}"
    end
  end
end

# Example usage
if __FILE__ == $0
  importer = UserImporter.new('http://localhost:5000/api')
  importer.import_from_csv('users.csv')
end
