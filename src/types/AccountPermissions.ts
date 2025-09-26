export interface AccountPermissions {
    read_directories: boolean,
    read_files: boolean,
    create: boolean,
    change: boolean,
    delete: boolean,
    move: boolean,
    download: boolean,
    upload: boolean,
    rename: boolean,
    unzip: boolean,
    copy: boolean,
    read_recovery: boolean,
    use_recovery: boolean
}