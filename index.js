function main() {
    const source_folder_id = "1KiI5A7HlKvYdgAjRpMKP7ob4vTKLabd2";
    const destination_folder_id = "1rQHl5WzuvMaxHQS8Xa7q5tdsEKGYwEVx";
  
    move_files(source_folder_id, destination_folder_id);
  }

function move_files(source_folder_id, destination_folder_id) {
  const source_folder = DriveApp.getFolderById(source_folder_id);
  const destination_folder = DriveApp.getFolderById(destination_folder_id);
  Logger.log(`Moving files from \`${source_folder.getName()}\` to \`${destination_folder_id.getName()}\``);

  const files = source_folder.getFiles();
  const folders = source_folder.getFolders();

  // Loop through the files and move them to the destination folder
  if (files) {
    while (files.hasNext()) {
      const file = files.next();

      file.moveTo(destination_folder);
      Logger.log(`Moved file \`${file.getName()}\` to \`${destination_folder.getName()}\``);
    }
  }

  // Loop through the child folders and move their files to the corresponding child folders in the destination directory
  if (folders) {
    while (folders.hasNext()) {
      const old_folder = folders.next();
      const old_folder_name = old_folder.getName();

      // Create a new folder in the destination directory with the same name as the source folder
      const new_folder = destination_folder.createFolder(old_folder_name);
      Logger.log(`Created new folder \`${old_folder_name}\``);

      // Recursively move the files from the source folder to the new destination folder
      move_files(old_folder.getId(), new_folder.getId());
    }
  }
}
   