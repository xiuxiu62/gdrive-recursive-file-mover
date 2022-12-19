function entry() {
  const spreadsheet_id = "181MggAaQNTfZ4THj2FwXWmqKy4FRsFc8k7zi8yDBID0";

  initialize();
  get_folder_move_ids(spreadsheet_id).forEach(move_source);
}

// Adds array builder methods
function initialize() {
  if (!Array.prototype.first)
    Array.prototype.first = function() { return this[0]; };

  if (!Array.prototype.last)
    Array.prototype.last = function() { return this[this.length - 1]; };
}

// Recursively moves folder into parent folder
function move_source(ids) {
  const source_folder_id = ids[0];
  const destination_parent_id = ids[1];
  var destination_folder_id = null;

  // Checks if destination folder already exists
  const source_folder_name = DriveApp.getFolderById(source_folder_id).getName();
  const parent_child_folders = DriveApp.getFolderById(destination_parent_id).getFolders();
  while (parent_child_folders.hasNext()) {
    const folder = parent_child_folders.next();
    if (source_folder_name == folder.getName()) {
      destination_folder_id = folder.getId();
      break;
    }
  }

  if (!destination_folder_id) {
    destination_folder_id = DriveApp
      .getFolderById(destination_parent_id)
      .createFolder(source_folder_name)
      .getId();
  }

  move_files(source_folder_id, destination_folder_id);
}

// Recursively moves files from a source folder to a destination folder
// This function preserves the original directory tree
function move_files(source_folder_id, destination_folder_id) {
  const source_folder = DriveApp.getFolderById(source_folder_id);
  const destination_folder = DriveApp.getFolderById(destination_folder_id);

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
      const destination_child_folders = destination_folder.getFolders();

      // Checks if destination folder already exists
      var new_folder = null;
      while (destination_child_folders.hasNext()) {
        const folder = destination_child_folders.next();
        if (old_folder_name == folder.getName()) {
          new_folder = folder;
          break;
        }
      }

      // Create a new folder in the destination directory with the same name as the source folder, if it isn't already there
      if (!new_folder) {
        new_folder = destination_folder.createFolder(old_folder_name);
        Logger.log(`Created new folder \`${old_folder_name}\``);
      }

      // Recursively move the files from the source folder to the new destination folder
      move_files(old_folder.getId(), new_folder.getId());
    }
  }
}

// Parses a list of source and destination ids from a spreadsheet
const get_folder_move_ids = (spreadsheet_id) =>
  SpreadsheetApp
    .openById(spreadsheet_id)
    .getDataRange()
    .getRichTextValues()
    .map(get_move_ids)
    .filter(Boolean);

// Optionally parses source and destination ids from a row, dependant on the row's move value 
const get_move_ids = (row) => row[2].getText() == "Yes" ? [get_id(row[0].getLinkUrl()), get_id(row[4].getLinkUrl())] : null;

// Parses the resource id from a google workspace url
const get_id = (url) => url.split("/").last().split("?").first();