<?php
  $mysqli = new mysqli("mysql.eecs.ku.edu","j939s316","eegh9Ah7","j939s316");
  

  $userid = $_POST['username'];
  $pass = $_POST['username'];
  
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

  $query = "SELECT user_id FROM Users WHERE user_id='$userid'";
  
  if ($result = $mysqli->query($query))
  {
      while ($row = $result->fetch_assoc()) {
          if ($userid == $row['user_id'])
          {
              echo "Username is already taken.";
              exit();
          }
      }

      $result->free();
  }

  $query = "INSERT INTO USERS (user_id, password) VALUES ('$userid','$pass')";
  mysqli_query($mysqli, $query);
  echo "$userid has been created"; 

?>