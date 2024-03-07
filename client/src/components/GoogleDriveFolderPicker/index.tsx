import { ChangeEvent, FC, useContext, useState } from 'react'

import cn from 'classnames'

import { ConvertedDataContext } from 'src/context/convertedDataContext.ts/ConvertedDataContext'
import { GoogleApiContext } from 'src/context/googleApiContext/GoogleApiContext'
import { useGoogleDrive } from 'src/hooks/useGoogleDrive'

import styles from './style.module.scss'

export interface Folder {
  id: string
  name: string
  parents: string[]
  subFolders: Folder[]
}

interface Props {
  handleShowModal: () => void
}

export const GoogleDriveFolderPicker: FC<Props> = ({ handleShowModal }) => {
  const { convertedData } = useContext(ConvertedDataContext)
  const { authResponse, folderList, isUserDriveFileUpolad } = useContext(GoogleApiContext)

  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState('root')
  const [sendFileToGoogleDriveResponse, setSendFileToGoogleDriveResponse] = useState(null)
  const { userDriveFileUpolad } = useGoogleDrive()

  const toggleFolder = (folderId: string) => {
    if (expandedFolders.includes(folderId)) {
      setExpandedFolders(expandedFolders.filter((id) => id !== folderId))
    } else {
      setExpandedFolders([...expandedFolders, folderId])
    }
  }

  const getStyle = (level: number) => {
    return { left: `-${level * 15 + 15}px` }
  }

  const handleToggle = (id: string) => {
    setSelectedFolder(id)
    toggleFolder(id)
  }

  const getClassName = (level: number) => {
    return styles[`folders__item_subfolder_${level}`]
  }

  const handleSendFileToFolder = async () => {
    try {
      const sendFileToGoogleDriveResponse = await userDriveFileUpolad(authResponse.access_token, convertedData, selectedFolder)
      setSendFileToGoogleDriveResponse(sendFileToGoogleDriveResponse)
    } catch (error) {
      console.log(error)
    }
  }

  const defalutFileName = convertedData.resourceName

  const handleFileNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    convertedData.resourceName = e.target.value
  }

  const renderFolders = (folders: Folder[], level: number) => {
    const folderLevel: number = level + 1
    return folders.map((folder) => (
      <div key={folder.id} className={styles.folders__item}>
        <div className={cn(styles.folders__item_inner, getClassName(level), { [styles.selected]: selectedFolder === folder.id })} role="button" tabIndex={0} onClick={() => handleToggle(folder.id)}>
          <div className={styles.folders__item_pre} style={getStyle(level)}>
            {`| ${new Array(level).fill('_').join('_')}`}
          </div>
          {folder.name}
        </div>
        {expandedFolders.includes(folder.id) && folder.subFolders.length > 0 && renderFolders(folder.subFolders, folderLevel)}
      </div>
    ))
  }

  return (
    <>
      {!isUserDriveFileUpolad && !sendFileToGoogleDriveResponse && (
        <>
          <div className={styles.folders__wrapper}>
            <div className={styles.folders__container}>
              <div className={styles.folders__item}>
                <div className={cn(styles.folders__item_inner, { [styles.selected]: selectedFolder === 'root' })} role="button" tabIndex={0} onClick={() => handleToggle('root')}>
                  <div className={styles.folders__item_pre} style={getStyle(1)}>
                    *
                  </div>
                  root folder
                </div>
              </div>
              {renderFolders(Object.values(folderList), 1)}
            </div>
          </div>
          <input className={styles.folders__fileName} defaultValue={defalutFileName} onChange={handleFileNameChange} />
          <button className={styles.folders__item__button_upload} type="button" onClick={handleSendFileToFolder}>
            Upload
          </button>
          <button className={styles.folders__item__button_cancel} type="button" onClick={handleShowModal}>
            Cancel
          </button>
        </>
      )}
      {isUserDriveFileUpolad && !sendFileToGoogleDriveResponse && <>Uploading</>}
      {sendFileToGoogleDriveResponse && <>File was uploaded</>}
    </>
  )
}
