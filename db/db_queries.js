// something like...

/*


const getStudents = "SELECT * FROM students";
const getStudentById = "SELECT * FROM students WHERE id = $1"; // $1 is a variable name
const checkEmailExists = "SELECT * FROM students WHERE email = $1" // $1 is [email] sent by controller.js
const addStudent = "INSERT INTO students (name, email, date_of_birth, age) VALUES ($1, $2, $3, $4)" // four arguments
const removeStudent = "DELETE FROM students WHERE id = $1"
const updateStudent = "UPDATE students SET name = $1 WHERE id = $2"

module.exports = {
    getStudents,
    getStudentById,
    checkEmailExists,
    addStudent,
    removeStudent,
    updateStudent
};


*/