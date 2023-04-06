import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { updateDoc, doc, setDoc, deleteField, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import Header from '../../../components/common/Header';
import * as S from './style';
import IconStarOn from '../../../assets/Icon-star-on.png';
import IconStarOff from '../../../assets/Icon-star-off.png';
import IconPrev from '../../../assets/Icon-detail-prev.png';
import IconNext from '../../../assets/Icon-detail-next.png';
import IconHeartOff from '../../../assets/Icon-Heart-off.png';
import IconHeartOn from '../../../assets/Icon-Heart-on.png';
import IconMore from '../../../assets/Icon-More.png';
import currentPost from '../../../atom/postRecoil';
import { authState } from '../../../atom/authRecoil';

function PostDetail() {
  const user = useRecoilValue(authState);
  const [post, setPost] = useRecoilState(currentPost);
  const [isLiked, setIsLiked] = useState(post.like);
  const postRef = doc(db, 'post', post.postId);
  const scoreIndexs = [0, 1, 2, 3, 4];
  const menuPrice = post.price;
  const priceComma = menuPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const hashtag = post.tag;

  useEffect(() => {
    addLikedListener();
  }, []);

  const addLikedListener = () => {
    onSnapshot(postRef, (state) => {
      setIsLiked(state.data().like);
      // currentPost가 파이어베이스 db 값 반영하게 되면 아래 코드 지우기
      const value = state.data();

      setPost({ ...post, like: value.like });
    });
  };

  const handleLikedBtn = async () => {
    setIsLiked((prev) => !prev);
    if (isLiked) {
      setPost({ ...post, like: false });
      await updateDoc(postRef, {
        like: false,
      });
      await updateDoc(doc(db, 'liked', user.uid), {
        [post.postId]: deleteField(),
      });
    } else {
      setPost({ ...post, like: true });
      await updateDoc(postRef, {
        like: true,
      });
      await setDoc(doc(db, 'liked', user.uid), {
        [post.postId]: { ...post, like: true },
      });
    }
  };

  // console.log(isLiked, post);

  const handleModal = () => {
    console.log('모달 클릭');
  };

  return (
    <>
      <Header
        title={post.category}
        rightChild={
          <>
            <S.HeaderBtn onClick={handleLikedBtn}>
              {isLiked ? (
                <img src={IconHeartOn} alt='좋아요 활성화' />
              ) : (
                <img src={IconHeartOff} alt='좋아요 비활성화' />
              )}
            </S.HeaderBtn>
            <S.HeaderBtn onClick={handleModal}>
              <img src={IconMore} alt='더보기 버튼' />
            </S.HeaderBtn>
          </>
        }
      />
      <S.Container>
        <header>
          <h1 className='ir'>게시글 상세 페이지</h1>
        </header>
        <S.Section>
          <h2 className='ir'>게시글 날짜, 메뉴명과 별점</h2>
          <S.DateInfo>23.02.13</S.DateInfo>
          <S.MenuInfo>{post.menu}</S.MenuInfo>
          <S.StarRatingContainer>
            {scoreIndexs.map((index) =>
              post.score > index ? (
                <img src={IconStarOn} alt='별점' key={index} />
              ) : (
                <img src={IconStarOff} alt='체크되지 않은 별점' aria-hidden='true' key={index} />
              ),
            )}
          </S.StarRatingContainer>
        </S.Section>
        <S.Section>
          <h2 className='ir'>메뉴 후기와 매장 정보</h2>
          <S.MenuImg
            src='https://raw.githubusercontent.com/christianB053/likelion/develop/coffee-2139592_960_720.jpg'
            alt='사용자가 올린 음료 사진'
          />
          <S.ListContainer>
            <S.ListItem>
              <S.ListTitle>후기</S.ListTitle>
              <p>{post.review}</p>
            </S.ListItem>
            <S.ListItem>
              <S.ListTitle>매장 정보</S.ListTitle>
              <S.DlContainer>
                <S.DlBox>
                  <S.DlTitle>가격</S.DlTitle>
                  <dd>{priceComma}원</dd>
                </S.DlBox>
                <S.DlBox>
                  <S.DlTitle>상호명</S.DlTitle>
                  <dd>{post.shop}</dd>
                </S.DlBox>
                <S.DlBox>
                  <S.DlTitle>위치</S.DlTitle>
                  <dd>{post.location}</dd>
                </S.DlBox>
              </S.DlContainer>
            </S.ListItem>
            <S.ListItem>
              <S.ListTitle>태그</S.ListTitle>
              {hashtag &&
                hashtag.map((tag, index) => (
                  <S.TagLink key={index} to='#'>
                    #{tag}
                  </S.TagLink>
                ))}
            </S.ListItem>
          </S.ListContainer>
          <S.BtnContainer>
            <S.Btn>
              <img src={IconPrev} alt='이전 게시글 보기' />
            </S.Btn>
            <S.Btn>
              <img src={IconNext} alt='다음 게시글 보기' />
            </S.Btn>
          </S.BtnContainer>
        </S.Section>
      </S.Container>
    </>
  );
}

export default PostDetail;
