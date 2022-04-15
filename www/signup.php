<?php
  $mysqli = new mysqli("mysql.eecs.ku.edu","n791d901","feos9Ahd","n791d901");

  echo "<a href='signup.html'>Back</a>";
  echo "<br>";

  $userid = $_POST['username'];
  $pass = $_POST['password'];
  
  if($mysqli->connect_errno)
  {
      printf("Connect failed: %s\n", $myqli->connect_error);
      exit();
  }

  if($userid == "" || $userid == "Username")
  {
      echo "Please enter a user id.";
      exit();
  }

  $query = "SELECT userid FROM Users WHERE userid='$userid'";
  
  if ($result = $mysqli->query($query))
  {
      while ($row = $result->fetch_assoc()) 
      {
          if ($userid == $row['userid'])
          {
              echo "Username is already taken.";
              exit();
          }
      }

      $result->free();
  }

  $query = "INSERT INTO Users (userid, password) VALUES ('$userid','$pass')";
  mysqli_query($mysqli, $query);
  echo "$userid has been created"; 

?>