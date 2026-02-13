package com.example.users;

public class User {
    private Long id;
    private String username;
    private String email;
    
    public User(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }
    
    public boolean validate() {
        return username != null && email != null && email.contains("@");
    }
    
    public String getEmail() {
        return email;
    }
}
