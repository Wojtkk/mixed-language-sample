#!/usr/bin/env ruby

class DataCleaner
  def self.clean_email(email)
    email.strip.downcase
  end

  def self.clean_username(username)
    username.strip.gsub(/[^a-zA-Z0-9_]/, '')
  end

  def self.validate_email(email)
    email.match?(/\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i)
  end

  def self.process_file(input_file, output_file)
    cleaned_lines = []
    
    File.readlines(input_file).each do |line|
      username, email = line.strip.split(',')
      next unless username && email
      
      cleaned_username = clean_username(username)
      cleaned_email = clean_email(email)
      
      if validate_email(cleaned_email)
        cleaned_lines << "#{cleaned_username},#{cleaned_email}"
      end
    end
    
    File.write(output_file, cleaned_lines.join("\n"))
    puts "Cleaned #{cleaned_lines.length} records"
  end
end
