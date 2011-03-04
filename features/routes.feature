Feature: Routes
	In order to access routes
	As an user registered in system
	I want to be able access routes
	
	Background:
		Given server running on port 8642

	Scenario: Routes index should require user
		When I go to path "/"
		Then I should be redirected to "/sessions/new"
		Then I should see flash error message "You must be logged in to view this page"

