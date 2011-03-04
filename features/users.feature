Feature: Users
	In order to use application
	As an user
	I want to be able register, login, logout, change password or email

	Background:
		Given server running on port 8642

	Scenario: Sign up user
		Given email "test(at)gmail.com" is not registered in app
		When I go to path "/users/new"
		Then I should see "New user registration"
		When I fill in "user[email]" with "test(at)gmail.com"
		And  I click button "Join!"
		Then I should be redirected to "/sessions/new"
		And I should see flash info message "Please check you email to confirm account and finish registration"
		And I should receive new email with subject "Activate your account"
		When I open email
		Then I should see "To activate you account follow the link:" in email body
		When I follow the link in email body
		Then I should see flash info message "Your email has been confirmed" 
		And I should see "choose your password"
		When I fill in "password" with "123456"
		And click button "Set password"
		Then I should be redirected to "/"
		And I should see "Password has been changed"

	Scenario: Login
		Given clear cookies in browser
		When I go to path "/"
		Then I should be redirected to "/sessions/new"
		Then I should see flash error message "You must be logged in to view this page"
		When I fill in "email" with "test(at)gmail.com"
		And fill in "password" with "123456"
		And click button "Sign me in"
		Then I should be redirected to "/"
		And I should see flash info message "You has been logged in"
		And I should see "New route"
		Then shutdown server
