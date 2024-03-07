import { ChangeEvent, FC, MouseEventHandler, useContext, useState } from 'react'

import cn from 'classnames'

import { GoogleApiContext } from 'src/context/googleApiContext/GoogleApiContext'
import { useProgressiveImage } from 'src/hooks/useProgressiveImage'

import styles from './style.module.scss'
import { DotsButton } from '../DotsButton'

interface Props {
  imageName: string
  resourceName: string
  handleFileDownload: (resourceName?: string) => Promise<void>
}

export const ImagePreviewButton: FC<Props> = ({ imageName, resourceName, handleFileDownload }) => {
  const { isLoggingIn } = useContext(GoogleApiContext)
  const [isPreviewPictureHovered, setIsPreviewPictureHovered] = useState(false)
  const [magnifiedPosition, setMagnifiedPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const previewImage = useProgressiveImage(imageName)

  const handleMouseEnter = () => {
    setIsPreviewPictureHovered(true)
  }
  const handleMouseLeave = () => {
    setTimeout(() => {
      setIsPreviewPictureHovered(false)
    }, 150)
  }

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMagnifiedPosition({ x, y })
  }

  const handleFileNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    resourceName = e.target.value
  }

  return (
    <>
      {previewImage && (
        <div className={cn(styles.preview__wrapper, styles.animationGradualAppearance, styles.animationDelay_025)}>
          <div
            className={cn(styles.preview__inner, { [styles.common__disableEvents]: isLoggingIn })}
            role="presentation"
            style={{ backgroundImage: `url(${previewImage}), repeating-linear-gradient(-45deg, #fff, #fff 25px, #ffde5a 25px, #ffde5a 50px` }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            <div className={styles.preview__inner_cursor} />
          </div>
          <div>
            {!isPreviewPictureHovered && (
              <label className={styles.preview__fileName_wrapper}>
                <span>File name</span>
                <input className={styles.folders__fileName} defaultValue={resourceName} onChange={handleFileNameChange} />
              </label>
            )}
            <div className={styles.preview__download_button__wrapper}>
              <div
                className={cn(styles.preview__download_button, { [styles.preview__download_button__animation]: isPreviewPictureHovered })}
                role="button"
                style={{
                  backgroundImage: `url(${isPreviewPictureHovered ? previewImage : ''})`,
                  backgroundPosition: `calc(${magnifiedPosition.x}% - 0%) calc(${magnifiedPosition.y}% - 0%)`
                }}
                tabIndex={0}
                onClick={() => handleFileDownload(resourceName)}
              >
                {!isPreviewPictureHovered && 'Download the converted file'}
              </div>
              {!isPreviewPictureHovered && <DotsButton />}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
