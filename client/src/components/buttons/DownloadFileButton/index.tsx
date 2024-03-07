import { FC } from 'react'

import cn from 'classnames'

import styles from './style.module.scss'
import { DotsButton } from '../DotsButton'

interface Props {
  handleFileDownload: (resourceName?: string) => Promise<void>
}

export const DownloadFileButton: FC<Props> = ({ handleFileDownload }) => {
  return (
    <div className={cn(styles.downloadButton__wrapper, styles.animationGradualAppearance, styles.animationDelay_025)}>
      <div className={styles.downloadButton__container}>
        <button className={styles.downloadButton} type="button" onClick={() => handleFileDownload('')}>
          Download the converted file
        </button>
        <DotsButton />
      </div>
    </div>
  )
}
