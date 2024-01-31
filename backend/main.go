package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/lib/pq"

	middleware "api/middleware"
)

type User struct {
	Id    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func main() {

	//connect to db
	fmt.Println("connecting to url:", os.Getenv("DATABASE_URL"))
	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))

	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// create table
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS users ( id SERIAL PRIMARY KEY , name TEXT , email TEXT)`)

	if err != nil {
		log.Fatal(err)
	}

	// create r
	r := mux.NewRouter()
	r.HandleFunc("/", homeHandler)
	r.HandleFunc("/api/go/users", getUsers(db)).Methods("GET")
	r.HandleFunc("/api/go/users", createUser(db)).Methods("POST")
	r.HandleFunc("/api/go/users/{id}", getUser(db)).Methods("GET")
	r.HandleFunc("/api/go/users/{id}", updateUser(db)).Methods("PUT")
	r.HandleFunc("/api/go/users/{id}", deleteUser(db)).Methods("DELETE")

	// wrap with cors and json middleware
	router := middleware.EnableCORS(middleware.JsonContentTypeMiddleware(r))

	// start server
	log.Fatal(http.ListenAndServe(":8000", router))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello World"))
}

func getUsers(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT * FROM users")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var users []User //? array of users

		for rows.Next() {
			var user User
			err := rows.Scan(&user.Id, &user.Name, &user.Email)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			users = append(users, user)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			log.Fatal(err)
			return
		}

		json.NewEncoder(w).Encode(users)
	}

}

func getUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id := params["id"]

		var user User
		err := db.QueryRow("SELECT * FROM users WHERE id = $1", id).Scan(&user.Id, &user.Name, &user.Email)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(user)

	}
}

func createUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user User
		inputErr := json.NewDecoder(r.Body).Decode(&user)
		if inputErr != nil {
			http.Error(w, inputErr.Error(), http.StatusBadRequest)
			return
		}

		err := db.QueryRow("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id", user.Name, user.Email).Scan(&user.Id)

		if err != nil {
			if pqErr, ok := err.(*pq.Error); ok {
				if pqErr.Code.Name() == "unique_violation" {
					http.Error(w, "User already exists", http.StatusConflict)
					return
				}
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return

		}
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(user)
	}
}

func deleteUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id := params["id"]

		var u User

		err := db.QueryRow("SELECT * FROM users WHERE id = $1", id).Scan(&u.Id, &u.Name, &u.Email)

		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		} else {
			_, err := db.Exec("DELETE FROM users WHERE id = $1", id)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode("User Deleted.")

		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func updateUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var u User
		json.NewDecoder(r.Body).Decode(&u)

		vars := mux.Vars(r)
		id := vars["id"]

		// Execute the update query
		_, err := db.Exec("UPDATE users SET name = $1, email = $2 WHERE id = $3", u.Name, u.Email, id)
		if err != nil {
			log.Fatal(err)
		}

		// Retrieve the updated user data from the database
		var updatedUser User
		err = db.QueryRow("SELECT id, name, email FROM users WHERE id = $1", id).Scan(&updatedUser.Id, &updatedUser.Name, &updatedUser.Email)
		if err != nil {
			log.Fatal(err)
		}

		// Send the updated user data in the response
		json.NewEncoder(w).Encode(updatedUser)
	}
}
